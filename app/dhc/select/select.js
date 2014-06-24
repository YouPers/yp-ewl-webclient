(function () {
    'use strict';

    angular.module('yp.dhc')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('select', {
                        templateUrl: "layout/default.html",
                        access: accessLevels.all
                    })
                    .state('select.content', {
                        url: "/select?offset",
                        reloadOnSearch: false,
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dhc/select/select.html',
                                controller: 'SelectController'
                            }
                        },
                        resolve: {
                            offers: ['ActivityService', function(ActivityService) {
                                return ActivityService.getActivityOffers();
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/select/select');
            }])

        .controller('SelectController', [ '$scope', '$rootScope', '$stateParams', '$location', '$window', '$timeout', 'offers', 'ProfileService',
            function ($scope, $rootScope, $stateParams, $location, $window, $timeout, offers, ProfileService) {

                $scope.offers = offers;

                // watch window width to adjust number of items displayed
                $scope.$watch(function() {
                    return $window.innerWidth;
                }, function() {


                    var dimensions = [
//                        480,
                        768,
//                        992,
                        1200
                    ];

                    var width = $window.innerWidth;
                    var n = 0;

                    if(width < dimensions[0]) {
                        n = 1;
                    } else if(width < dimensions[1]) {
                        n = 2;
                    } else {
                        n = 3;
                    }
                    $scope.cardsPerView = n;

                } );



                $scope.reject = function(index, event) {
                    event.stopPropagation();

                    var user = $scope.principal.getUser();
                    // add it to the collection of rejected Activities in the profile
                    user.profile.prefs.rejectedActivities.push({activity: $scope.offers[index].activity.id, timestamp: new Date()});
                    // remove it from the starred list
                    _.remove(user.profile.prefs.starredActivities, function (starred) {
                        return starred.activity === $scope.offers[index].activity.id;
                    });

                    // save the profile
                    ProfileService.putProfile(user.profile);
                    $scope.offers.splice(index, 1);

                };

                $scope.schedule = function(activity) {
                    $scope.$state.go('schedule.offer', {id: activity.id});
                };

            }
        ]);

}());