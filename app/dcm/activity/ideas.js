(function () {
    'use strict';

    angular.module('yp.dcm')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('ideas', {
                        templateUrl: "layout/dcm-default.html",
                        access: accessLevels.campaignlead
                    })
                    .state('ideas.content', {
                        url: "/ideas",
                        access: accessLevels.campaignlead,
                        views: {
                            content: {
                                templateUrl: 'dcm/activity/ideas.html',
                                controller: 'IdeasController'
                            }
                        },
                        resolve: {
                            ideas: ['ActivityService', 'CampaignService', function (ActivityService, CampaignService) {
                                return ActivityService.getIdeas({campaign: CampaignService.currentCampaign && CampaignService.currentCampaign.id});
                            }]
                        }
                    })
                    .state('idea', {
                        templateUrl: "layout/dcm-default.html",
                        access: accessLevels.campaignlead
                    })
                    .state('idea.content', {
                        url: "/ideas/:id",
                        access: accessLevels.campaignlead,
                        views: {
                            content: {
                                templateUrl: 'dcm/activity/idea.html',
                                controller: 'IdeaController'
                            }
                        },
                        resolve: {
                            idea: ['$stateParams', 'ActivityService', 'CampaignService', function ($stateParams, ActivityService, CampaignService) {

                                if ($stateParams.id) {
                                    return ActivityService.getIdea($stateParams.id);
                                } else {

                                    // TODO: define default idea and options visible for the campaign lead
                                    var currentCampaignTopic = (CampaignService.currentCampaign && CampaignService.currentCampaign.topic) || undefined;
                                    var topics = [];
                                    if (currentCampaignTopic) {
                                        topics.push(currentCampaignTopic);
                                    }
                                    return {
                                        "number": "CampaignActivity",
                                        source: "campaign",
                                        defaultfrequency: "once",
                                        "defaultexecutiontype": "group",
                                        "defaultvisibility": "campaign",
                                        "defaultduration": 60,
                                        topics: topics,
                                        campaign: (CampaignService.currentCampaign && CampaignService.currentCampaign.id) || undefined
                                    };
                                }

                            }]
                        }
                    })
                    .state('campaignoffers', {
                        templateUrl: "layout/dcm-default.html",
                        access: accessLevels.campaignlead
                    })
                    .state('campaignoffers.content', {
                        url: "/campaignoffers/:id",
                        access: accessLevels.campaignlead,
                        views: {
                            content: {
                                templateUrl: 'dcm/activity/campaignoffers.html',
                                controller: 'CampaignOffersController'
                            }
                        },
                        resolve: {
                            offers: ['$stateParams', 'ActivityService', 'CampaignService',
                                function ($stateParams, ActivityService, CampaignService) {
                                    if (CampaignService.currentCampaign) {
                                        return ActivityService.getActivityOffers({campaign: CampaignService.currentCampaign.id,
                                            populate: 'idea activityPlan'});
                                    } else {
                                        return [];
                                    }
                                }
                            ]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/activity/activity');
            }])


        .controller('IdeaController', [ '$scope', '$rootScope', '$state', 'ActivityService', 'idea',
            function ($scope, $rootScope, $state, ActivityService, idea) {

                $scope.idea = idea;

                $scope.offer = {
                    idea: idea,
                    recommendedBy: [$scope.principal.getUser()],
                    sourceType: 'campaign'
                };

            }
        ])

        .controller('IdeasController', [ '$scope', '$rootScope', 'ideas', 'ActivityService', 'CampaignService',
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

                $scope.$watch(function () {
                    return CampaignService.currentCampaign;
                }, function (newValue, oldValue) {
                    ActivityService.getIdeas({campaign: CampaignService.currentCampaign.id}).then(function (ideas) {
                        _initializeIdeas(ideas);
                    });
                });
            }
        ])

        // TODO: refactor to new file
        .controller('CampaignOffersController', ['$scope', '$rootScope', 'offers', 'CampaignService', 'ActivityService', 'NotificationService',
            function ($scope, $rootScope, offers, CampaignService, ActivityService) {

                $scope.offers = offers;

                $scope.getJoiningUsers = function (plan) {
                    return _.pluck(plan.joiningUsers, 'fullname').join('<br/>');
                };

                $scope.$watch(function () {
                    return CampaignService.currentCampaign;
                }, function (newValue, oldValue) {
                    if (newValue) {
                        ActivityService.getActivityOffers(
                            {
                                campaign: newValue.id,
                                populate: 'idea activityPlan',
                                populatedeep: 'activityPlan.joiningUsers'
                            }
                        ).then(function (offers) {
                                $scope.offers = offers;
                            });
                    }
                });
            }])

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
        .run(['enums', function (enums) {
            _.merge(enums, {
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