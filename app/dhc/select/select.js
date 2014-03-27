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

                        }
                    });

//                $translateWtiPartialLoaderProvider.addPart('yp.dhc.select');
            }])

        .controller('SelectController', [ '$scope', '$rootScope', '$stateParams', '$location', '$window', '$timeout', 'ActivityService',
            function ($scope, $rootScope, $stateParams, $location, $window, $timeout, ActivityService) {

                // TODO: get width from DOM instead of hard coding it
                var cardWidth = 20.4;

                $scope.$watch('slider.itemsPerView', function () {
                    $scope.outerListStyle = {
                        width: cardWidth * $scope.slider.itemsPerView + 'em'
                    };
                });

                $scope.$watch('slider.offset', function () {
                    $location.search({ s: $scope.slider.offset });
                    $scope.innerListStyle = {
                        left: - $scope.slider.offset * cardWidth + 'em'
                    };
                });

                $scope.slider = {
                    offset: $stateParams.s || 0,
                    itemsPerView: 3,
                    prev: function() {
                        if($scope.slider.hasPrev()) {
                            $scope.slider.offset -= 1;
                        }
                    },
                    next: function() {
                        if($scope.slider.hasNext()) {
                            $scope.slider.offset += 1;
                        }
                    },
                    hasPrev: function() {
                        return $scope.slider.offset > 0;
                    },
                    hasNext: function() {
                        return $scope.slider.items && $scope.slider.offset < $scope.slider.items.length - $scope.slider.itemsPerView;
                    }
                };

                // watch window width to adjust number of items displayed
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

                $scope.isItemActive = function (index) {
                    return $scope.slider.offset <= index && $scope.slider.offset + $scope.slider.itemsPerView > index;
                };

                $scope.showItem = function (index) {
                    // place in the middle if 3 items are displayed
                    $scope.slider.offset = index - ($scope.slider.itemsPerView === 3 ? 1 : 0);
                };

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