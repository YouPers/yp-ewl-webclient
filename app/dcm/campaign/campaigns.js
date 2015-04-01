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

                            if (UserService.principal.isAuthenticated()) { // already logged in
                                if (UserService.principal.getUser().id === invitedUser.id) { // correct user
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
                            }],
                            usersInCampaign: ['UserService', 'campaign', function (UserService, campaign) {
                                return !campaign ? undefined : UserService.getUsers({ campaign: campaign.id }).then(function (users) {
                                    return users && users.length > 0;
                                });
                            }]

                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/campaign/campaign');
            }])


        .controller('CampaignController', ['$scope', 'CampaignService', 'UserService', 'HealthCoachService',
            'PaymentCodeService', 'organization', 'campaign', 'campaigns', 'topics', 'newTopic', 'yp.config', 'usersInCampaign',
            function ($scope, CampaignService, UserService, HealthCoachService,
                      PaymentCodeService, organization, campaign, campaigns, topics, newTopic, config, usersInCampaign) {

                $scope.campaignController = this;
                $scope.paymentCodeCheckingDisabled = (config.paymentCodeChecking === 'disabled');
                $scope.usersInCampaign = usersInCampaign;
                this.campaignLeadVerified = campaign && campaign.campaignLeads && campaign.campaignLeads[0].emailValidatedFlag;

                // we store the main Leaders Id so we can compare on save
                $scope.initialMainCampaignLeadId = campaign && campaign.campaignLeads && (campaign.campaignLeads[0].id || campaign.campaignLeads[0]);

                $scope.dateOptions = {
                    'year-format': "'yy'",
                    'starting-day': 1
                };

                if (campaign) {
                    $scope.campaign = campaign;
                    $scope.campaignEnded = moment().isAfter(campaign.end);
                    $scope.campaignStart = _.clone(campaign.start);
                    $scope.campaignEnd = _.clone(campaign.end);
                } else {
                    if (!newTopic) {
                        throw new Error("no topic found, we should always have a topic to create a new campaign");
                    }

                    // default start date = Monday in 2 weeks
                    var start = new Date(moment().day(1).hour(8).minutes(0).seconds(0).add(2, 'weeks'));
                    // default end date = Friday of the 4th week since the start date
                    var end = new Date(moment(start).day(5).hour(17).minutes(0).seconds(0).add(3, 'weeks'));
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

                $scope.disabledStart = usersInCampaign;
                $scope.disabledEnd = $scope.campaignEnded;
                $scope.minDateStart = $scope.disabledStart ? undefined : moment().toDate();

                // watch and ensure that start is before end date of a campaign, using the same default weekday/duration as above
                $scope.$watch('campaign.start', function (date) {

                    $scope.campaignStartChanged = $scope.campaignStart && !moment(date).isSame(moment($scope.campaignStart));

                    var campaign = $scope.campaign;
                    $scope.minDateEnd = $scope.disabledEnd ? undefined : moment(campaign.start).hour(17).minutes(0).seconds(0).add(1, 'days').toDate();
                    $scope.maxDateEnd = $scope.disabledEnd ? undefined : moment(campaign.start).day(5).hour(17).minutes(0).seconds(0).add(8, 'weeks').toDate();

                    if (moment(campaign.start).isAfter(campaign.end)) {
                        campaign.end = moment(campaign.start).day(5).hour(17).minutes(0).seconds(0).add(3, 'weeks').toDate();
                    }
                });

                $scope.$watch('campaign.end', function (date) {
                    $scope.campaignEndChanged = $scope.campaignEnd && !moment(date).isSame(moment($scope.campaignEnd));
                    $scope.campaignEndChangeRecreatesOffers = moment().isBefore($scope.campaign.start) && !usersInCampaign;
                });

                // gather campaign leads from all campaigns
                var campaignLeads = organization.administrators;
                _.each(campaigns, function (campaign) {
                    campaignLeads = campaignLeads.concat(campaign.campaignLeads);
                });

                $scope.availableCampaignLeads = function () {
                    // once the campaignLead is verified, we don't give the option to change anymore,
                    // only list the current campaignLeads
                    if ($scope.campaignController.campaignLeadVerified) {
                        return $scope.campaign.campaignLeads;
                    } else {
                        return _.unique(campaignLeads.concat($scope.campaign.campaignLeads), 'id');
                    }
                };

                // we keep the newCampaignLeads in the campaign.newCampaignLeads, for a correct campaign-card
                $scope.newCampaignLeads = _.filter.bind(this, $scope.campaign.campaignLeads, function (campaignLead) {
                    return !campaignLead.id;
                });
                $scope.allCampaignLeads = function () {
                    return $scope.campaign.campaignLeads.concat($scope.campaign.newCampaignLeads);
                };
                $scope.newCampaignLead = {emailValidatedFlag: false};

                $scope.submitNewCampaignLead = function () {
                    $scope.newCampaignLead.fullname = $scope.newCampaignLead.firstname + ' ' + $scope.newCampaignLead.lastname;
                    $scope.newCampaignLead.username = $scope.newCampaignLead.email;
                    $scope.newCampaignLead.avatar = config.webclientUrl + '/assets/img/default_avatar_woman.png';
                    $scope.campaign.campaignLeads = [_.clone($scope.newCampaignLead)];
                    _.each($scope.newCampaignLead, function (value, key) {
                        delete $scope.newCampaignLead[key];
                    });

                    $scope.campaignForm.$setDirty();
                    $scope.campaignLeadForm.$setPristine();
                    $scope.campaignController.showNewCampainleadForm = false;
                    $scope.campaignLeadChanged = true;
                };


                $scope.isAssigned = function (campaignLead) {
                    return _.any($scope.campaign.campaignLeads, function (cl) {
                        return cl.id === campaignLead.id;
                    });
                };

                $scope.isOrgAdm = function (campaignLead) {
                    return _.any(organization.administrators, function (oa) {
                        return oa.id === campaignLead.id;
                    });
                };

                $scope.assignCampaignLead = function (campaignLead) {
                    if ($scope.isAssigned(campaignLead)) {
                        _.remove($scope.campaign.campaignLeads, {id: campaignLead.id});
                    } else {
                        $scope.campaign.campaignLeads = [campaignLead];
                    }
                    if ($scope.initialMainCampaignLeadId && $scope.initialMainCampaignLeadId !== campaignLead.id) {
                        $scope.campaignLeadChanged = true;
                    } else {
                        $scope.campaignLeadChanged = false;
                    }
                };

                $scope.validatePaymentCode = function (code) {
                    var validationFailedResult = config.paymentCodeChecking === 'disabled' ? true : false;
                    if (!code) {
                        return;
                    }

                    if (code.length < 14 || code.length > 14) {
                        $scope.validPaymentCode = validationFailedResult;
                        $scope.paymentCode = {status: 404};
                        return;
                    }
                    PaymentCodeService.validatePaymentCode({
                        code: code,
                        topic: $scope.campaign.topic.id
                    }).then(function (result) {
                        $scope.paymentCode = result;

                        $scope.validPaymentCode = true;
                        //$scope.campaign.productType = result.productType;

                    }, function (reason) {

                        $scope.invalidTopic = _.find(topics, {id: reason.data.data.expected});
                        $scope.paymentCode = reason;
                        $scope.validPaymentCode = validationFailedResult;
                    });
                };

                $scope.canDelete = $scope.campaign.id && !usersInCampaign;

                $scope.deleteCampaign = function () {
                    $scope.$root.$broadcast('busy.begin', {url: "campaign", name: "deleteCampaign"});

                    CampaignService.deleteCampaign($scope.campaign).then(function () {

                        // remove the deleted campaign from the list in the state-parent resolve
                        _.remove(campaigns, function (camp) {
                            return camp.id === $scope.campaign.id;
                        });
                        $scope.$root.$broadcast('busy.end', {url: "campaign", name: "saveCampaign"});
                        $scope.$state.go('dcm.home', {campaignId: ''});
                    }, function (err) {
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

                    // recreate campaign and all offers, if
                    // - campaign start has changed OR
                    // - campaign end has changed AND the campaign has NOT already started
                    // - campaignLead has changed (we need to do that, because otherwise the new CampaignLead cannot edit
                    //   the default answers.
                    if ($scope.campaignStartChanged ||
                        ($scope.campaignEndChanged && $scope.campaignEndChangeRecreatesOffers) ||
                        ($scope.initialMainCampaignLeadId && ($scope.initialMainCampaignLeadId !== ($scope.campaign.campaignLeads[0].id || $scope.campaign.campaignLeads[0])))
                    ) {
                        CampaignService.deleteCampaign($scope.campaign).then(function () {
                            _.remove(campaigns, 'id', $scope.campaign.id);
                            delete $scope.campaign.id;
                            save();
                        }, onError);
                    } else {
                        save();
                    }

                    function save() {
                        $scope.campaign.start = moment($scope.campaign.start).startOf('day').toDate();
                        $scope.campaign.end = moment($scope.campaign.end).endOf('day').toDate();

                        // preserve the main campaignlead
                        var options = {
                            defaultCampaignLead:  $scope.campaign.campaignLeads[0]
                        };

                        // remove the new campaignleads from the regular campaignleads collection and put them in a special
                        // one, the backend needs to store them first before they can be added to the regular collection.
                        $scope.campaign.newCampaignLeads = _.remove($scope.campaign.campaignLeads, function (campaignLead) {
                            return !campaignLead.id;
                        });

                        if ($scope.campaign.id) {
                            CampaignService.putCampaign($scope.campaign, options).then(function (savedCampaign) {
                                // we need to get the campaign again from the backend, to get the updated, populated
                                // campaignLeads
                                CampaignService.getCampaign(savedCampaign.id).then(function(reloadedCampaign) {
                                    // merging saved object into the existing object to preserve references in the parent state

                                    delete reloadedCampaign.organization; // keep the populated organization
                                    _.merge($scope.campaign, reloadedCampaign);

                                    $scope.$state.go('dcm.home');
                                    $scope.$root.$broadcast('busy.end', {url: "campaign", name: "saveCampaign"});
                                });
                            }, onError);
                        } else {
                            $scope.campaign.paymentCode = $scope.paymentCode;

                            CampaignService.postCampaign($scope.campaign, options)
                                .then(function (campaign) {

                                    // queue healthCoach message for new campaigns
                                    if (!$scope.campaign.id) {
                                        HealthCoachService.queueEvent('campaignCreated');
                                    }
                                    $scope.$state.go('dcm.home', {campaignId: campaign.id});
                                    $scope.$root.$broadcast('busy.end', {url: "campaign", name: "saveCampaign"});
                                }, onError);
                        }
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