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
                templateUrl: 'dhc/game/game-area-directive.html',

                link: function (scope, elem, attrs) {

                    var flex = elem[0].querySelector('.flex');
                    if(!flex) {
                        throw new Error('container with class "flex" not found');
                    }

                    scope.showMore = function() {
                        scope.areaHeight += 2;
                        $timeout(function () {
                            if(scope.hasOverflow) {
                                scope.showMore();
                            }
                        }, 100);
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