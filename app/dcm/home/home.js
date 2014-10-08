(function () {
    'use strict';

    angular.module('yp.dcm')

        .config(['$stateProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('dcm.home', {
                        url: "/home",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dcm/home/home.html',
                                controller: 'HomeController as homeController'
                            }

                        },
                        resolve: {


                            jsInclude: ["util", function (util) {
                                return util.loadJSInclude('lib/d3/d3.js');
                            }],


                            healthCoachEvent: ['OrganizationService', 'organization', 'campaigns', 'campaign',
                                function (OrganizationService, organization, campaigns, campaign) {


                                    var daysSinceCampaignStart = campaign ? moment().diff(moment(campaign.start), 'days') : undefined;
                                    var daysUntilCampaignEnd = campaign ? moment(campaign.end).diff(moment(), 'days') : undefined;


                                    if(!OrganizationService.isComplete(organization)) {
                                        return 'organizationIncomplete';
                                    } else if(campaigns.length === 0) {
                                        return 'noCampaigns';
                                    } else if(daysSinceCampaignStart === 0) {
                                        return 'campaignStartedToday';
                                    } else if(daysSinceCampaignStart >= 2 && daysSinceCampaignStart <= 7) {
                                        return 'campaignFirstWeek';
                                    } else if(daysSinceCampaignStart > 7 && daysUntilCampaignEnd > 7) {
                                        return 'campaignAfterFirstWeek';
                                    } else if(daysUntilCampaignEnd <= 7) {
                                        return 'campaignLastWeek';
                                    } else if(daysUntilCampaignEnd <= 0) {
                                        return 'campaignEnded';
                                    }


                                }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/home/home');
            }])



        .controller('HomeController', ['$scope', '$rootScope', '$state', 'UserService', 'SocialInteractionService', 'campaign', 'campaigns', 'healthCoachEvent',
            function ($scope, $rootScope, $state, UserService, SocialInteractionService, campaign, campaigns, healthCoachEvent) {

                if(campaign) {
                    $scope.$watch('homeController.showOld', function (showOld) {
                        var options = {
                            populate: 'author',
                            targetId: campaign.id,
                            authored: true,
                            authorType: 'campaignLead'
                        };

                        if(showOld) {
                            options.publishFrom = false;
                            options.publishTo = false;
                        } else {
                            options.publishFrom = false;
                            options.publishTo = new Date();
                        }

                        SocialInteractionService.getSocialInteractions(options).then(function (sis) {

                            $scope.offers = _.sortBy(_.filter(sis, function(si) {
                                return si.__t === 'Recommendation' || si.__t === 'Invitation';
                            }), function (si) {
                                return si.publishFrom;
                            });
                            _.each($scope.offers, function (offer) {
                                offer.idea = offer.idea || offer.activity.idea;
                            });

                        });
                    });
                }

                $scope.healthCoachEvent = healthCoachEvent;
                $scope.homeController = this;
                $scope.homeController.filterByPublishDate = false;
                $scope.campaign = campaign;
                if (!campaign && campaigns.length > 0) {
                    $state.go('dcm.home', { campaignId: campaigns[0].id });
                } else {
                    $scope.campaignStarted = campaign && moment(campaign.start).isBefore(moment());
                }
            }])

        .controller('HomeStatsController', ['$scope', 'StatsService', function ($scope, StatsService) {
            $scope.chartData = {};

            init();

            ///////////////////

            function init() {

                if ($scope.campaign) {
                    var options = {
                        runningTotal: true,
                        newestDay: moment.min(moment(), moment($scope.campaign.end)),
                        nrOfDaysToPlot: 7
                    };

                    StatsService.loadStats($scope.campaign.id, {type: 'newUsersPerDay', scopeType: 'campaign', scopeId: $scope.campaign.id}).then(function (result) {
                        $scope.chartData.newUsers = StatsService.fillAndFormatForPlot(result[0].newUsersPerDay, options);
                        $scope.currentUserCount = result[0].newUsersPerDay && result[0].newUsersPerDay[result[0].newUsersPerDay.length - 1].count;
                    });



                    StatsService.loadStats($scope.campaign.id, {type: 'activitiesPlannedPerDay', scopeType: 'campaign', scopeId: $scope.campaign.id}).then(function (result) {
                        $scope.chartData.plannedActs = StatsService.fillAndFormatForPlot(result[0].activitiesPlannedPerDay,  {
                            newestDay: moment(),
                            nrOfDaysToPlot: 7
                        });
                    });
                }
            }

        }])

    .controller('HomeMessagesController', ['$scope', '$rootScope', '$state', 'UserService', 'SocialInteractionService',
        function ($scope, $rootScope, $state, UserService, SocialInteractionService) {
            var self = this;

            self.onMessageSaved = function (message) {
                self.messages.unshift(message);
            };

            self.soiRemoved = function (soi) {
                _.remove(self.messages, { id: soi.id });
            };

            self.soiEdited = function (soi) {
                $scope.editedMessage = soi;
            };

            init();
           //-----------

            function init() {

                if ($scope.campaign) {

                    var options = {
                        populate: 'author',
                        targetId: $scope.campaign.id,
                        authored: true,
                        authorType: 'campaignLead'
                    };

                    $scope.$watch('homeController.showOld', function (showOld) {
                        if(showOld) {
                            options.publishFrom = false;
                            options.publishTo = false;
                        } else {
                            options.publishFrom = false;
                            options.publishTo = new Date();
                        }
                        SocialInteractionService.getMessages(options).then(function (messages) {
                            self.messages = messages;
                        });

                    });

                }

            }
        }]);

}());