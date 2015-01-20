(function () {

    'use strict';

    angular.module('yp.components.gameAreaSidePanel', [])
        .directive('gameAreaSidePanel', ['$rootScope', '$sce', '$window', '$state', function ($rootScope, $sce, $window, $state) {
            return {
                restrict: 'EA',
                scope: {
                    iconClass: '@',
                    type: '@'
                },
                transclude: true,
                templateUrl: 'dhc/game/game-area-side-panel-directive.html',

                link: function (scope, elem, attrs) {

                }
            };

        }]);

}());