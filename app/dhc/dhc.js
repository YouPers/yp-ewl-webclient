(function () {
    'use strict';


    angular.module('yp.dhc',
        [
            'ngSanitize',
            'restangular',
            'ui.router',
            'vr.directives.slider',

            'yp.components'
        ])

        .config(['$stateProvider', 'accessLevels', '$translateWtiPartialLoaderProvider', function ($stateProvider, accessLevels, $translateWtiPartialLoaderProvider) {

            $stateProvider
                .state('dhc', {

                    abstract: true,

                    url: "/campaign/:campaignId",
                    templateUrl: "layout/single-column.html",
                    controller: 'DhcController as dhcController',

                    access: accessLevels.all,

                    resolve: {
                        campaign: ['$stateParams', 'CampaignService', function ($stateParams, CampaignService) {

                            if ($stateParams.campaignId) {
                                return CampaignService.getCampaign($stateParams.campaignId);
                            } else {
                                return undefined;
                            }

                        }]
                    }
                });
        }])

        .controller('DhcController', ['$scope', '$rootScope', '$state', 'UserService', 'campaign',
            function ($scope, $rootScope, $state, UserService, campaign) {

                $scope.parentState = 'dhc';

                if (!campaign) {
                    var user = UserService.principal.getUser();
                    if(user.campaign) {
                        $state.transitionTo('dhc.game', { campaignId: user.campaign.id || user.campaign });
                    } else {
                        $state.go('campaign-list.content');
                    }

                }
                $scope.currentCampaign = campaign;
            }]);

}());