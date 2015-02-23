(function () {

    'use strict';

    angular.module('yp.components.gameArea', [])
        .directive('gameArea', ['$timeout', function ($timeout) {
            return {
                restrict: 'EA',
                scope: {
                    areaHeight: '=',
                    type: '@'
                },
                transclude: true,
                templateUrl: 'dhc/game/game-area-directive.html',

                link: function (scope, elem, attrs) {

                    var type = scope.type || 'column';

                    var flex = elem[0].querySelector('.flex');
                    if(flex) {
                        scope.$watch(function() {
                            return type === 'row' ? flex.scrollHeight : flex.scrollWidth;
                        }, function() {
                            scope.hasOverflow =  type === 'row' ? flex.scrollHeight > flex.clientHeight : flex.scrollWidth > flex.clientWidth;
                        });
                    }

                    scope.showMore = function() {
                        scope.areaHeight = type === 'row' ? 0 : scope.areaHeight + 4;
                        $timeout(function () {
                            if(scope.hasOverflow) {
                                scope.showMore();
                            }
                        }, 100);
                    };


                }
            };

        }]);

}());