(function () {
    'use strict';

    angular.module('yp.dcm')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('dcm.ideas', {
                        url: "/ideas",
                        access: accessLevels.campaignlead,
                        views: {
                            content: {
                                templateUrl: 'dcm/activity/ideas.html',
                                controller: 'DcmIdeasController as dcmIdeasController'
                            }
                        },
                        resolve: {
                            ideas: ['ActivityService', 'campaign', function (ActivityService, campaign) {
                                return ActivityService.getIdeas({campaign: campaign.id || campaign, topic: campaign.topic.id || campaign.topic}).then(function (ideas) {
                                    return _.sortBy(ideas, "title");
                                });
                            }]
                        }
                    })
                    .state('dcm.idea', {
                        url: "/ideas/:id",
                        access: accessLevels.campaignlead,
                        views: {
                            content: {
                                templateUrl: 'dcm/activity/idea.html',
                                controller: 'DcmIdeaController'
                            }
                        },
                        resolve: {
                            idea: ['$stateParams', 'ActivityService', 'CampaignService', function ($stateParams, ActivityService, CampaignService) {

                                if ($stateParams.id) {
                                    return ActivityService.getIdea($stateParams.id);
                                } else {

                                    return CampaignService.getCampaign($stateParams.campaignId).then(function (campaign) {

                                        return {
                                            source: "campaign",
                                            defaultfrequency: "once",
                                            "defaultexecutiontype": "group",
                                            "defaultvisibility": "campaign",
                                            "defaultduration": 60,
                                            topics: [campaign.topic.id],
                                            campaign: $stateParams.campaignId
                                        };
                                    });

                                }

                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/activity/activity');
            }])


        .controller('DcmIdeaController', [ '$scope', '$rootScope', '$state', 'ActivityService', 'idea',
            function ($scope, $rootScope, $state, ActivityService, idea) {
                $scope.options = {};

                $scope.idea = idea;
                $scope.onSave = function () {
                    $scope.options.dropdownOpen = true;
                };
                $scope.back = function() {
                    $state.go('homedispatcher');
                };

            }
        ])

        .controller('DcmIdeasController', [ '$scope', '$rootScope', 'ideas', 'campaign',
            function ($scope, $rootScope, ideas, campaign) {
                var dcmIdeasController = this;
                $scope.campaign = campaign;
                $scope.ideas = ideas;

                $scope.toggleListItem = function ($index) {
                    dcmIdeasController.expanedListItem = dcmIdeasController.expanedListItem === $index ? undefined : $index
                };
            }
        ])


        .filter('fulltext', function () {
            return function (ideas, query) {
                if (!query || query.length < 3) {
                    return ideas;
                }
                return _.filter(ideas, function (idea) {
                    return (!query || (idea.title.toUpperCase() + idea.number.toUpperCase()).indexOf(query.toUpperCase()) !== -1);
                });

            };
        })
        .run(['$rootScope', function ($rootScope) {
            _.merge($rootScope.enums, {
                executiontype: [
                    'self',
                    'group'
                ],
                activityPlanFrequency: [
                    'once',
                    'day',
                    'week',
                    'month'
                ],
                visibility: [
                    'public',
                    'campaign',
                    'private'
                ],
                source: [
                    'youpers',
                    'community',
                    'campaign'
                ],
                calendarNotifications: [
                    'none',
                    '0',
                    '300',
                    '600',
                    '900',
                    '1800',
                    '3600',
                    '7200',
                    '86400',
                    '172800'
                ]
            });
        }]);

}());