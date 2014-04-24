(function () {
    'use strict';

    angular.module('yp.dcm.activity',
        [
            'restangular',
            'ui.router'
        ])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('activities', {
                        templateUrl: "layout/single-column.html",
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
                            activities: ['ActivityService', function(ActivityService) {
                                return ActivityService.getActivities();
                            }]
                        }
                    })
                    .state('activity', {
                        templateUrl: "layout/single-column.html",
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
                            activity: ['$stateParams', 'ActivityService', function($stateParams, ActivityService) {

                                if($stateParams.id) {
                                    return ActivityService.getActivity($stateParams.id);
                                } else {
                                    return undefined;
                                }

                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/activity/activity');
            }])



        .controller('ActivityController', [ '$scope', '$rootScope', '$state', 'ActivityService', 'activity',
            function ($scope, $rootScope, $state, ActivityService, activity) {


                $scope.activity = activity;

                $scope.offer = {
                    activity: activity,
                    recommendedBy: {}
                };

            }
        ])

        .controller('ActivitiesController', [ '$scope', 'activities',
            function ($scope, activities) {

                var grouped = _.groupBy(activities, function(activity) {
                    return activity.campaign ? "campaign" : "all";
                });


                var groups = [
                    'campaign',
                    'all'
                ];

                $scope.groups = [];

                _.forEach(groups, function (group) {
                    if(grouped[group]) {

//                        var list = _.sortBy(grouped[group], function(item) {
//                            return ;
//                        });

                        $scope.groups.push({
                            name: group,
                            activities: grouped[group]
                        });
                    }
                });

            }
        ])
        .filter('fulltext', function() {
            return function (activities, query) {
                return _.filter(activities, function(activity) {
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