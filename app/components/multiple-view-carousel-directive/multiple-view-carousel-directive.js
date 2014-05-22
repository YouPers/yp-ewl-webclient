(function () {

    'use strict';

    angular.module('yp.components')
        .directive('multipleViewCarousel', ['$location', '$state', function ($location, $state) {
            return {
                restrict: 'E',
                transclude: true,
                scope: {
                    items: "=",
                    itemsPerView: "=",
                    itemWidthEm: "="
                },
                templateUrl: 'components/multiple-view-carousel-directive/multiple-view-carousel-directive.html',

                link: function ($scope, elem, attrs) {

                    $scope.$watch(function () {
                        return $location.search();
                    }, function (newValue, oldValue) {

                        if($state.current.previous.name && newValue.offset &&
                            parseInt($scope.slider.offset) !== parseInt(newValue.offset)) {

                            $scope.$parent.back();
                        }

                    });

                    $scope.itemsPerView = $scope.itemsPerView || 1;

                    $scope.$watch('itemsPerView', function () {
                        $scope.outerListStyle = {
                            width: $scope.itemWidthEm * $scope.itemsPerView + 'em'
                        };
                    });

                    $scope.$watch('slider.offset', function () {
                        $location.search({ offset: $scope.slider.offset });
                        $scope.innerListStyle = {
                            left: - $scope.slider.offset * $scope.itemWidthEm + 'em',
                            width: ($scope.items ? $scope.itemWidthEm * ($scope.items.length + 1) + 'em' : 0)
                        };
                    });

                    $scope.slider = {
                        offset: $location.search().offset || 0,

                        prev: function() {
                            if($scope.slider.hasPrev()) {
                                $scope.slider.offset = parseInt($scope.slider.offset) - 1;
                            }
                        },
                        next: function() {
                            if($scope.slider.hasNext()) {
                                $scope.slider.offset = parseInt($scope.slider.offset) + 1;
                            }
                        },
                        hasPrev: function() {
                            return $scope.slider.offset > 0;
                        },
                        hasNext: function() {
                            return $scope.items && $scope.items.length && $scope.slider.offset < $scope.items.length - $scope.itemsPerView;
                        }
                    };

                    $scope.isItemActive = function (index) {
                        return $scope.slider.offset <= index && $scope.slider.offset + $scope.itemsPerView > index;
                    };

                    $scope.showItem = function (index) {
                        // place in the middle if 3 items are displayed
                        $scope.slider.offset = index - ($scope.itemsPerView === 3 ? 1 : 0);
                    };

                }
            };
        }]);

}());