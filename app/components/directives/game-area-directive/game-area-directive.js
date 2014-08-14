(function () {

    'use strict';

    angular.module('yp.components.gameArea', [])
        .directive('gameArea', ['$timeout', function ($timeout) {
            return {
                restrict: 'EA',
                scope: {
                    areaHeight: '='
                },
                transclude: true,
                templateUrl: 'components/directives/game-area-directive/game-area-directive.html',

                link: function (scope, elem, attrs) {

                    var elements = elem[0].getElementsByClassName('flex');
                    if(elements.length !== 1) {
                        throw new Error('container with class "flex" not found or not unique');
                    }
                    var flex = elements[0];

                    scope.showMore = function() {
                        scope.areaHeight += 2;
                        $timeout(function () {
                            if(scope.hasOverflow) {
                                scope.showMore();
                            }
                        }, 140);
                    };

                    scope.$watch(function() {
                        return flex.scrollWidth;
                    }, function() {
                        scope.hasOverflow =  flex.scrollWidth > flex.clientWidth;
                    });

                }
            };

        }]);

}());