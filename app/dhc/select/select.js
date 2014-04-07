(function () {
    'use strict';

    angular.module('yp.dhc.select',
        [
            'restangular',
            'ui.router'
        ])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('select', {
                        templateUrl: "layout/default.html",
                        access: accessLevels.all
                    })
                    .state('select.content', {
                        url: "/select?s",
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

        .controller('SelectController', [ '$scope', '$rootScope', '$stateParams', '$location', '$window', '$timeout', 'offers',
            function ($scope, $rootScope, $stateParams, $location, $window, $timeout, offers) {

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
                    $scope.offers.splice(index, 1);
                };


            }
        ]);

}());