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
                templateUrl: 'components/directives/game-area-side-panel-directive/game-area-side-panel-directive.html',

                link: function (scope, elem, attrs) {

                }
            };

        }]);

}());