(function () {
    'use strict';

    angular.module('yp.dcm')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
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


        .controller('CampaignController', ['$scope', 'CampaignService', 'UserService', 'HealthCoachService', 'PaymentCodeService', 'campaign', 'campaigns', 'topics', 'newTopic',
            function ($scope, CampaignService, UserService, HealthCoachService, PaymentCodeService, campaign, campaigns, topics, newTopic) {

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
                        start: start,
                        end: end,
                        topic: newTopic,
                        title: newTopic.name,
                        avatar: newTopic.picture
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

                $scope.inviteCampaignLead = function (emails, campaign) {
                    CampaignService.inviteCampaignLead(emails, campaign.id).then(function () {
                        $scope.invitationSent = true;
                    });
                };

                $scope.showForm = function () {
                    $scope.formVisible = true;
                    $scope.invitationSent = false;
                };


                $scope.validatePaymentCode = function(code) {
                    if(!code) {
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
        ]);


}());