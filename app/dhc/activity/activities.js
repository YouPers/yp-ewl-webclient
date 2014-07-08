(function () {
    'use strict';

    angular.module('yp.dhc')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('activity', {
                        templateUrl: "layout/default.html",
                        access: accessLevels.all
                    })
                    .state('activity.list', {
                        url: "/activities?status",
                        reloadOnSearch: false,
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dhc/activity/activities.html',
                                controller: 'ActivitiesController'
                            }
                        },
                        resolve: {
                            activities: ['ActivityService', function(ActivityService) {
                                return ActivityService.getActivities({ populate: 'idea owner' });
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/activity/activity');
            }])

        .controller('ActivitiesController', [ '$scope', '$rootScope', '$stateParams', '$location', '$window', '$timeout', 'activities',
            function ($scope, $rootScope, $stateParams, $location, $window, $timeout, activities) {

                function filterActivities(status) {
                    return _.filter(activities, function (activity) {

                        if(status === 'active') {
                            return activity.status === 'active';
                        } else if(status === 'done') {
                            return activity.status === 'old';
                        } else {
                            return false;
                        }
                    });
                }

                function init() {
                    $scope.status = $location.search().status || 'active';
                    $scope.activities = filterActivities($scope.status);
                }

                init();


                $scope.$watch(function () {
                    return $location.search();
                }, function (newValue, oldValue) {
                    init();
                });



            }
        ]);

}());