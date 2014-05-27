(function () {
    'use strict';

    angular.module('yp.dcm')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('activities', {
                        templateUrl: "layout/dcm-default.html",
                        access: accessLevels.campaignlead
                    })
                    .state('activities.content', {
                        url: "/activities",
                        access: accessLevels.campaignlead,
                        views: {
                            content: {
                                templateUrl: 'dcm/activity/activities.html',
                                controller: 'ActivitiesController'
                            }
                        },
                        resolve: {
                            activities: ['ActivityService', 'CampaignService', function (ActivityService, CampaignService) {
                                return ActivityService.getActivities({campaign: CampaignService.currentCampaign && CampaignService.currentCampaign.id});
                            }]
                        }
                    })
                    .state('activity', {
                        templateUrl: "layout/dcm-default.html",
                        access: accessLevels.campaignlead
                    })
                    .state('activity.content', {
                        url: "/activities/:id",
                        access: accessLevels.campaignlead,
                        views: {
                            content: {
                                templateUrl: 'dcm/activity/activity.html',
                                controller: 'ActivityController'
                            }
                        },
                        resolve: {
                            activity: ['$stateParams', 'ActivityService', 'CampaignService', function ($stateParams, ActivityService, CampaignService) {

                                if ($stateParams.id) {
                                    return ActivityService.getActivity($stateParams.id);
                                } else {

                                    // TODO: define default activity and options visible for the campaign lead

                                    return {
                                        "number": "CampaignActivity",
                                        source: "campaign",
                                        defaultfrequency: "once",
                                        "defaultexecutiontype": "group",
                                        "defaultvisibility": "campaign",
                                        "defaultduration": 60,
                                        topics: ['workLifeBalance'],
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
                                            populate: 'activity activityPlan'});
                                    } else {
                                        return [];
                                    }
                                }
                            ]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/activity/activity');
            }])


        .controller('ActivityController', [ '$scope', '$rootScope', '$state', 'ActivityService', 'activity',
            function ($scope, $rootScope, $state, ActivityService, activity) {


                $scope.activity = activity;

                $scope.offer = {
                    activity: activity,
                    recommendedBy: [$scope.principal.getUser()],
                    sourceType: 'campaign'
                };

            }
        ])

        .controller('ActivitiesController', [ '$scope', '$rootScope', 'activities', 'ActivityService', 'CampaignService',
            function ($scope, $rootScope, resolvedActivities, ActivityService, CampaignService) {

                function _initializeActivities(activities) {
                    var grouped = _.groupBy(activities, function (activity) {
                        return activity.campaign ? "campaign" : "all";
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
                                activities: grouped[group]
                            });
                        }
                    });

                }

                _initializeActivities(resolvedActivities);

                $scope.$watch(function () {
                    return CampaignService.currentCampaign;
                }, function (newValue, oldValue) {
                    ActivityService.getActivities({campaign: CampaignService.currentCampaign.id}).then(function (activities) {
                        _initializeActivities(activities);
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
                                populate: 'activity activityPlan',
                                populatedeep: 'activityPlan.joiningUsers'
                            }
                        ).then(function (offers) {
                                $scope.offers = offers;
                            });
                    }
                });
            }])

        .filter('fulltext', function () {
            return function (activities, query) {
                if (!query || query.length < 3) {
                    return activities;
                }
                return _.filter(activities, function (activity) {
                    return (!query || (activity.title.toUpperCase() + activity.number.toUpperCase()).indexOf(query.toUpperCase()) !== -1);
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