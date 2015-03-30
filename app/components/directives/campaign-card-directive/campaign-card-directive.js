(function () {

    'use strict';

    angular.module('yp.components.campaignCard', [])
        .directive('campaignCard', ['CampaignService',
            function (CampaignService) {
            return {
                restrict: 'E',
                scope: {
                    campaign: '=',
                    showNavLink: '='
                },
                transclude: true,
                templateUrl: 'components/directives/campaign-card-directive/campaign-card-directive.html',

                link: function (scope, elem, attrs) {
                    scope.isCampaignLead = CampaignService.isCampaignLead(scope.campaign);
                }
            };
        }]);
}());