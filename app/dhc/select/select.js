(function () {
    'use strict';

    angular.module('yp.dhc.select',
        [
            'restangular',
            'ui.router',
            'ngAnimate'
        ])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('select', {
                        templateUrl: "layout/default.html",
                        access: accessLevels.all
                    })
                    .state('select.content', {
                        url: "/select",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dhc/select/select.html',
                                controller: 'SelectController'
                            }
                        },
                        resolve: {

                        }
                    });

//                $translateWtiPartialLoaderProvider.addPart('yp.dhc.select');
            }])

        .controller('SelectController', [ '$scope', '$rootScope', '$window', '$timeout', 'ActivityService',
            function ($scope, $rootScope, $window, $timeout, ActivityService) {

                $scope.$watch('slider.offset', function (offset) {
                    $scope.style = { left: - offset * 280 + 'px' }
                });

                $scope.slider = {
                    offset: 0,
//                    numberOfPages: function(){
//                        return $scope.slider.items ? Math.ceil($scope.slider.items.length / $scope.slider.itemsPerPage) : 0;
//                    },
                    itemsPerView: 0,
                    prev: function() {
                        if($scope.slider.hasPrev()) {
                            $scope.slider.offset -= 1;
                            $scope.animationClass = 'right-out';
                            $timeout(function () {
                                $scope.animationClass = '';
                            }, 400);
                        }
                    },
                    next: function() {
                        if($scope.slider.hasNext()) {
                            $scope.slider.offset += 1;
                            $scope.animationClass = 'left-out';
                            $timeout(function () {
                                $scope.animationClass = '';
                            }, 400);
                        }
                    },
                    hasPrev: function() {
                        return $scope.slider.offset > 0;
                    },
                    hasNext: function() {
                        return $scope.slider.items && $scope.slider.offset < $scope.slider.items.length - 1 - $scope.slider.itemsPerView;
                    }
                };

                $scope.$watch( function() {

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
                    $scope.slider.itemsPerView = n;

                } );

                ActivityService.getActivityOffers().then(function(offers) {
                    $scope.slider.items = offers;
                });

                $scope.reject = function(index, event) {
                    event.stopPropagation();
                    $scope.slider.items.splice(index, 1);
                };


            }
        ]);

}());