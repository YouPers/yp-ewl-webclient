(function () {

    'use strict';

    angular.module('yp.components.gameAreaSidePanel', [])
        .directive('gameAreaSidePanel', ['$rootScope', '$sce', '$window', '$state', function ($rootScope, $sce, $window, $state) {
            return {
                restrict: 'EA',
                scope: {
                    iconClass: '@'
                },
                transclude: true,
                templateUrl: 'dhc/game/game-area-side-panel-directive.html',

                link: function (scope, elem, attrs) {
                    scope.$watch('zoom', function(zoom) {
                        scope.$emit('gameAreaSidePanel:zoom', zoom);
                    })
                }
            };

        }]);

}());