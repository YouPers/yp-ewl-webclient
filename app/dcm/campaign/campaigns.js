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
                            invitedUser: ['UserService', '$stateParams', '$q', function (UserService, $stateParams, $q) {
                                return UserService.getUser($stateParams.invitedUserId).catch(function (err) {
                                    return $q.reject(err.status === 404 ? 'clientmsg.error.invitedUserNotFound' : err);
                                });
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
                                    return users && users.length > campaign.campaignLeads.length;
                                });
                            }]

                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/campaign/campaign');
            }])


        .controller('CampaignController', ['$scope', 'CampaignService', 'UserService', 'HealthCoachService',
            'PaymentCodeService', 'organization', 'campaign', 'campaigns', 'topics', 'newTopic', 'yp.config', 'usersInCampaign',
            function ($scope, CampaignService, UserService, HealthCoachService,
                      PaymentCodeService, organization, campaignOriginal, campaigns, topics, newTopic, config, usersInCampaign) {

                var campaign = _.clone(campaignOriginal);

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

                    // default start date = today
                    var start = new Date(moment().hour(8).minutes(0).seconds(0));
                    // default end date = Friday of the 4th week since the start date
                    var end = new Date(moment(start).businessAdd(19).hour(17).minutes(0).seconds(0));
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


                $scope.$watch('campaignForm', function(form) {
                    if (form) {
                        // mark the form as submitted to display errors form the beginning
                        // WL-2021:
                        form.submitted = true;
                    }
                });

                var newCampaignLeadEmpty = {emailValidatedFlag: false};

                $scope.newCampaignLead = _.clone(newCampaignLeadEmpty);

                $scope.submitNewCampaignLead = function () {
                    $scope.newCampaignLead.fullname = $scope.newCampaignLead.firstname + ' ' + $scope.newCampaignLead.lastname;
                    $scope.newCampaignLead.username = $scope.newCampaignLead.email;
                    $scope.newCampaignLead.avatar = config.webclientUrl + '/assets/img/default_avatar_woman.png';
                    $scope.campaign.campaignLeads = [_.clone($scope.newCampaignLead)];

                    $scope.newCampaignLead = _.clone(newCampaignLeadEmpty);
                    $scope.campaignForm.$setDirty();
                    $scope.campaignLeadForm.$setPristine();
                    $scope.campaignController.showNewCampainleadForm = false;
                    $scope.campaignLeadChanged = true;
                };

                $scope.isAssigned = function (user) {
                    user = user || $scope.principal.getUser();
                    return _.any($scope.campaign.campaignLeads, function (cl) {
                        return cl.id === user.id;
                    });
                };

                $scope.isOrgAdm = function (campaignLead) {
                    return _.any(organization.administrators, function (oa) {
                        return oa.id === campaignLead.id;
                    });
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

                $scope.canDelete = $scope.campaign.id && !usersInCampaign && $scope.isOrgAdm($scope.principal.getUser());

                $scope.canBecomeCampaignLead = function() {
                    var user = $scope.principal.getUser();

                    var isOrgAdmin = _.any(organization.administrators, function (oa) {
                        return oa.id === user.id;
                    });
                    var leadsOrParticipatesInOtherCampaign = user.campaign;

                    var isAlreadySelected = ($scope.campaign.campaignLeads[0] && $scope.campaign.campaignLeads[0].id) === user.id;
                    return isOrgAdmin && !leadsOrParticipatesInOtherCampaign && !isAlreadySelected;

                };

                $scope.becomeCampaignLead = function() {
                    $scope.campaign.campaignLeads = [$scope.principal.getUser()];
                };

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

                $scope.resendCampaignLeadInvite = function (campaignLeadId) {
                    $scope.resendSent = false;
                    return CampaignService.resendCampaignLeadInvite($scope.campaign.id, campaignLeadId)
                        .then(function () {
                            $scope.resendSent = true;
                        }, onError);
                };

                function onError(err) {
                    $scope.$emit('clientmsg:error', err);
                    $scope.campaignController.submitting = false;
                    $scope.$root.$broadcast('busy.end', {url: "campaign", name: "saveCampaign"});
                }

                $scope.saveCampaign = function () {
                    $scope.campaignController.submitting = true;
                    if ($scope.campaignForm.$invalid) {
                        $scope.campaignForm.submitted = true;
                        $scope.campaignController.submitting = false;
                        return;
                    }

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
                        CampaignService.deleteCampaign($scope.campaign).then(function (deleteResult) {
                            _.remove(campaigns, 'id', $scope.campaign.id);
                            var campaignId = $scope.campaign.id;
                            delete $scope.campaign.id; // needed for post instead of put
                            // reuse campaignId
                            save(campaignId, deleteResult && deleteResult.code);
                        }, onError);
                    } else {
                        save();
                    }

                    function save(campaignId, paymentCodeOfDeletedCampaign) {

                        $scope.campaign.start = moment($scope.campaign.start).startOf('day').toDate();
                        $scope.campaign.end = moment($scope.campaign.end).endOf('day').toDate();

                        var options = {};

                        if (campaignId) {
                            // provide campaignId as query parameter, does not work as body parameter
                            options.campaignId = campaignId;
                        }

                        // remove the new campaignleads from the regular campaignleads collection and put them in a special
                        // one, the backend needs to store them first before they can be added to the regular collection.
                        $scope.campaign.newCampaignLeads = _.remove($scope.campaign.campaignLeads, function (campaignLead) {
                            return !campaignLead.id;
                        });

                        if ($scope.campaign.id) {
                            CampaignService.putCampaign($scope.campaign, options).then(function (savedCampaign) {
                                // we need to get the campaign again from the backend, to get the updated, populated
                                // campaignLeads
                                CampaignService.getCampaign(savedCampaign.id).then(function (reloadedCampaign) {
                                    // merging saved object into the existing object to preserve references in the parent state

                                    delete reloadedCampaign.organization; // keep the populated organization
                                    _.merge($scope.campaign, reloadedCampaign);

                                    $scope.$state.go('dcm.home', undefined, { reload: true });
                                    $scope.$root.$broadcast('busy.end', {url: "campaign", name: "saveCampaign"});
                                });
                            }, onError);
                        } else {
                            $scope.campaign.paymentCode = paymentCodeOfDeletedCampaign || $scope.paymentCode;

                            CampaignService.postCampaign($scope.campaign, options)
                                .then(function (campaign) {
                                    // reloading the current user, in case it is now in another campaign.
                                    UserService.reload().then(function () {
                                        // queue healthCoach message for new campaigns
                                        if (!$scope.campaign.id) {
                                            HealthCoachService.queueEvent('campaignCreated');
                                        }
                                        $scope.$state.go('dcm.home', {campaignId: campaign.id}, {reload: true});
                                        $scope.$root.$broadcast('busy.end', {url: "campaign", name: "saveCampaign"});
                                    });
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
                        }, true).then(function () {
                            $state.go('dcm.home');
                        });
                    });
                };
            }
        ]);


}());