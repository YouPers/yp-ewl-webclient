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

                    scope.topicName = function () {
                        var topicNames = {
                            '53b416cfa43aac62a2debda1': 'Stress',
                            '53b416fba43aac62a2debda2': 'Nutrition',
                            '53b416fba43aac62a2debda3': 'Fitness'
                        };
                        return topicNames[scope.campaign.topic];
                    };
                }
            };
        }]);
}());