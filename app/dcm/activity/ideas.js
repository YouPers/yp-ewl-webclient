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
                                controller: 'DcmIdeasController'
                            }
                        },
                        resolve: {
                            ideas: ['ActivityService', 'CampaignService', function (ActivityService, CampaignService) {
                                return ActivityService.getIdeas({campaign: CampaignService.currentCampaign && CampaignService.currentCampaign.id});
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
                                            "number": "CampaignActivity",
                                            source: "campaign",
                                            defaultfrequency: "once",
                                            "defaultexecutiontype": "group",
                                            "defaultvisibility": "campaign",
                                            "defaultduration": 60,
                                            topics: [campaign.topic],
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

                $scope.idea = idea;

            }
        ])

        .controller('DcmIdeasController', [ '$scope', '$rootScope', 'ideas', 'ActivityService', 'CampaignService',
            function ($scope, $rootScope, resolvedIdeas, ActivityService, CampaignService) {

                function _initializeIdeas(ideas) {
                    var grouped = _.groupBy(ideas, function (idea) {
                        return idea.campaign ? "campaign" : "all";
                    });
                    $scope.query = {query: ''};

                    var groups = [
//                        'campaign',
                        'all'
                    ];

                    $scope.groups = [];

                    _.forEach(groups, function (group) {
                        if (grouped[group]) {

                            $scope.groups.push({
                                name: group,
                                ideas: grouped[group]
                            });
                        }
                    });

                }

                _initializeIdeas(resolvedIdeas);

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
                    'month',
                    'year'
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