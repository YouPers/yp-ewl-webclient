(function () {

    'use strict';

    angular.module('yp.components.campaignCard', [])
        .directive('campaignCard', [
            function () {
            return {
                restrict: 'E',
                scope: {
                    campaign: '='
                },
                transclude: true,
                templateUrl: 'components/directives/campaign-card-directive/campaign-card-directive.html',

                link: function (scope, elem, attrs) {

                }
            };
        }]);
}());