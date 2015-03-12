(function () {
    'use strict';

    angular.module('yp.dcm')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider

                    .state('campaignLeadResetPassword', {
                        url: '/campaigns/{id}/campaignLeadResetPassword?invitingUserId&invitedUserId&username&accessToken',
                        access: accessLevels.all,
                        templateUrl: 'dcm/campaign/campaign-lead-reset-password.html',
                        controller: 'CampaignLeadResetPasswordController as campaignLeadResetPasswordController',
                        resolve: {
                            campaign: ['CampaignService', '$stateParams', function (CampaignService, $stateParams) {
                                return CampaignService.getCampaign($stateParams.id);
                            }],
                            invitingUser: ['UserService', '$stateParams', function (UserService, $stateParams) {
                                return UserService.getUser($stateParams.invitingUserId);
                            }],
                            invitedUser: ['UserService', '$stateParams', function (UserService, $stateParams) {
                                return UserService.getUser($stateParams.invitedUserId);
                            }]
                        },
                        onEnter: ['$state', '$window', 'UserService', 'invitedUser', function ($state, $window, UserService, invitedUser) {

                            if(UserService.principal.isAuthenticated()) { // already logged in
                                if(UserService.principal.getUser().id === invitedUser.id) { // correct user
                                    $state.go('dcm.home');
                                } else { // wrong user
                                    UserService.logout().then(function () {
                                        $window.location.reload();
                                    });
                                }
                            }
                        }]
                    })

                    .state('dcm.campaigns', {
                        url: "/campaigns",
                        access: accessLevels.campaignlead,
                        views: {
                            content: {
                                templateUrl: 'dcm/campaign/campaigns.html',
                                controller: 'CampaignsController'
                            }
                        },
                        resolve: {
                            campaigns: ['CampaignService', function (CampaignService) {
                                return CampaignService.getCampaigns({populate: 'topic'});
                            }]
                        }
                    })
                    .state('dcm.campaign', {
                        url: "/edit?newTopicId",
                        access: accessLevels.campaignlead,
                        views: {
                            content: {
                                templateUrl: 'dcm/campaign/campaign.html',
                                controller: 'CampaignController as campaignController'
                            }
                        },
                        resolve: {
                            topics: ['Restangular', function (Restangular) {
                                return Restangular.all('topics').getList();
                            }],
                            newTopic: ['$stateParams', 'topics', function ($stateParams, topics) {
                                var topicId = $stateParams.newTopicId;
                                if (topicId) {
                                    return _.find(topics, function (topic) {
                                        return (topic.id === topicId);
                                    });
                                } else {
                                    return null;
                                }
                            }]

                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/campaign/campaign');
            }])


        .controller('CampaignController', ['$scope', 'CampaignService', 'UserService', 'HealthCoachService', 'PaymentCodeService',
            'organization', 'campaign', 'campaigns', 'topics', 'newTopic',
            function ($scope, CampaignService, UserService, HealthCoachService, PaymentCodeService,
                      organization, campaign, campaigns, topics, newTopic) {

                $scope.campaignController = this;

                $scope.dateOptions = {
                    'year-format': "'yy'",
                    'starting-day': 1
                };

                // default start date = Monday in 2 weeks
                var start = new Date(moment().day(1).hour(8).minutes(0).seconds(0).add(2, 'weeks'));
                // default end date = Friday of the 4th week since the start date
                var end = new Date(moment(start).day(5).hour(17).minutes(0).seconds(0).add(3, 'weeks'));

                if (campaign) {
                    $scope.campaign = campaign;
                } else {
                    if (!newTopic) {
                        throw new Error("no topic found, we should always have a topic to create a new campaign");
                    }
                    $scope.campaign = {
                        organization: organization,
                        start: start,
                        end: end,
                        topic: newTopic,
                        title: newTopic.name,
                        avatar: newTopic.picture,
                        campaignLeads: [],
                        newCampaignLeads: []
                    };
                }


                // watch and ensure that start is before end date of a campaign, using the same default weekday/duration as above
                $scope.$watch('campaign.start', function (date) {
                    var campaign = $scope.campaign;
                    if (moment(campaign.start).diff(moment(campaign.end), 'weeks') > -1) {
                        campaign.end = moment(campaign.start).day(5).hour(17).minutes(0).seconds(0).add(3, 'weeks').toDate();
                    }
                });
                $scope.$watch('campaign.end', function (date) {
                    var campaign = $scope.campaign;
                    if (moment(campaign.start).diff(moment(campaign.end), 'weeks') > -1) {
                        campaign.start = moment(campaign.end).day(1).hour(8).minutes(0).seconds(0).subtract(3, 'weeks').toDate();
                    }
                });

                // gather campaign leads from all campaigns
                var campaignLeads = organization.administrators;
                _.each(campaigns, function (campaign) {
                    campaignLeads = campaignLeads.concat(campaign.campaignLeads);
                });
                $scope.availableCampaignLeads = _.unique(campaignLeads, 'id');
                $scope.allCampaignLeads = function () {
                    return $scope.campaign.campaignLeads.concat($scope.campaign.newCampaignLeads);
                };
                $scope.campaignController.newCampaignLead = {};

                $scope.submitNewCampaignLead = function () {
                    $scope.newCampaignLead.fullname = $scope.newCampaignLead.firstname + ' ' + $scope.newCampaignLead.lastname;
                    $scope.newCampaignLead.username = $scope.newCampaignLead.email;
                    $scope.campaign.newCampaignLeads.push(_.clone($scope.newCampaignLead));
                    _.each($scope.newCampaignLead, function (value, key) {
                        delete $scope.newCampaignLead[key];
                    });
                    $scope.campaignForm.$setDirty();
                    $scope.campaignLeadForm.$setPristine();
                };
                $scope.isAssigned = function (campaignLead) {
                    return _.any($scope.campaign.campaignLeads, function (cl) {
                        return cl.id === campaignLead.id;
                    });
                };
                $scope.assignCampaignLead = function (campaignLead) {
                    if($scope.isAssigned(campaignLead)) {
                        _.remove($scope.campaign.campaignLeads, { id: campaignLead.id });
                    } else {
                        $scope.campaign.campaignLeads.push(campaignLead);
                    }
                };
                $scope.$watch('campaignForm.$dirty', function () {
                    $scope.$parent.$broadcast('initialize-scroll-along');
                });


                $scope.validatePaymentCode = function(code) {
                    if(!code) {
                        return;
                    }

                    if (code.length < 14 || code.length > 14) {
                        $scope.validPaymentCode = false;
                        $scope.paymentCode = {status: 404};
                        return;
                    }
                    PaymentCodeService.validatePaymentCode({ code: code, topic: $scope.campaign.topic.id}).then(function(result) {
                        $scope.paymentCode = result;

                        $scope.validPaymentCode = true;
                        //$scope.campaign.productType = result.productType;

                    }, function(reason) {

                        $scope.invalidTopic = _.find(topics, { id: reason.data.data.expected });
                        $scope.paymentCode = reason;
                        $scope.validPaymentCode = false;
                    });
                };

                $scope.canDelete = $scope.campaign.id;

                $scope.deleteCampaign = function () {
                    $scope.$root.$broadcast('busy.begin', {url: "campaign", name: "deleteCampaign"});

                    CampaignService.deleteCampaign($scope.campaign).then(function () {

                        // remove the deleted campaign from the list in the state-parent resolve
                        _.remove(campaigns, function (camp) {
                            return camp.id === $scope.campaign.id;
                        });
                        $scope.$root.$broadcast('busy.end', {url: "campaign", name: "saveCampaign"});
                        $scope.$state.go('dcm.home', {campaignId: ''});
                    }, function(err) {
                        $scope.$emit('clientmsg:error', 'alreadyJoinedUsers');
                    });
                };

                function onError(err) {
                    $scope.$emit('clientmsg:error', err);
                    $scope.campaignController.submitting = false;
                    $scope.$root.$broadcast('busy.end', {url: "campaign", name: "saveCampaign"});
                }

                $scope.saveCampaign = function () {
                    $scope.$root.$broadcast('busy.begin', {url: "campaign", name: "saveCampaign"});

                    $scope.campaign.start = moment($scope.campaign.start).startOf('day').toDate();
                    $scope.campaign.end = moment($scope.campaign.end).endOf('day').toDate();


                    if ($scope.campaign.id) {
                        CampaignService.putCampaign($scope.campaign).then(function (campaign) {
                            $scope.$state.go('dcm.home');
                            $scope.$root.$broadcast('busy.end', {url: "campaign", name: "saveCampaign"});

                        }, onError);
                    } else {
                        var options = {};
                        if($scope.defaultCampaignLead) {
                            options.defaultCampaignLead = $scope.defaultCampaignLead.username;
                        }
                        CampaignService.postCampaign($scope.campaign)
                            .then(function (campaign) {

                                // queue healthCoach message for new campaigns
                                if (!$scope.campaign.id) {
                                    HealthCoachService.queueEvent('campaignCreated');
                                }
                                $scope.$state.go('dcm.home', {campaignId: campaign.id});
                                $scope.$root.$broadcast('busy.end', {url: "campaign", name: "saveCampaign"});
                            }, onError);
                    }
                };
            }
        ])

        .controller('CampaignsController', ['$scope', 'campaigns',
            function ($scope, campaigns) {

                var groupedCampaigns = _.groupBy(campaigns, function (campaign) {
                    return moment(campaign.end) > moment() ? "active" : "inactive";
                });


                var groups = [
                    'active',
                    'inactive'
                ];

                $scope.groups = [];

                _.forEach(groups, function (group) {
                    if (groupedCampaigns[group]) {

                        var campaigns = _.sortBy(groupedCampaigns[group], function (campaign) {
                            return campaign.start;
                        });

                        $scope.groups.push({
                            name: group,
                            campaigns: campaigns
                        });
                    }
                });

            }
        ])

        .controller('CampaignLeadResetPasswordController', ['$scope', '$state', '$stateParams', 'UserService', 'campaign', 'invitingUser', 'invitedUser',
            function ($scope, $state, $stateParams, UserService, campaign, invitingUser, invitedUser) {

                $scope.campaign = campaign;
                $scope.translateValues = {
                    invitingUser: invitingUser.fullname,
                    invitedUser: invitedUser.fullname,
                    campaign: campaign
                };

                $scope.passwordReset = function () {
                    UserService.passwordReset($scope.$stateParams.accessToken, $scope.passwordResetObj.password).then(function () {
                        UserService.login({
                            username: $stateParams.username,
                            password: $scope.passwordResetObj.password
                        }).then(function () {
                            $state.go('dcm.home');
                        });
                    });
                };
            }
        ]);


}());