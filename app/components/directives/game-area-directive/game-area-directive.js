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


                    scope.showMore = function() {
                        scope.areaHeight += 2;
                        $timeout(function () {
                            if(scope.hasOverflow()) {
                                scope.showMore();
                            }
                        }, 200);

                    };

                    // TODO: refactor to directive in order to get rid of the direct DOM access
                    scope.hasOverflow = function () {
                        var elements = elem[0].getElementsByClassName('flex');
                        if(elements.length !== 1) {
                            throw new Error('container with class "flex" not found or not unique');
                        }
                        var element = elements[0];
                        return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
                    };

                }
            };

        }]);

}());