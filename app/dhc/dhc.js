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

        .config(['$stateProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, accessLevels, $translateWtiPartialLoaderProvider) {

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
                    },

                    onEnter: ['$rootScope', '$state', 'UserService', function($rootScope, $state, UserService){
                        var user = UserService.principal.getUser();
                        var campaign = user.campaign;

                        // last 2 days of the users campaign -> redirect non-campaignAdmins to dhc end of campaign
                        // if endOfCampaignDisplayed has not been set yet, or it is more than 1 day in the past
                        if(!$rootScope.isCampaignAdmin &&
                            (!campaign.endOfCampaignDisplayed || moment().diff(campaign.endOfCampaignDisplayed, 'days') > 1) &&
                            moment().diff(campaign.end, 'days') >= -2) {
                            campaign.endOfCampaignDisplayed = moment();
                            return $state.transitionTo('dhc.end-of-campaign', { campaignId: campaign.id });
                        }
                    }]
                });


        }])

        .controller('DhcController', ['$scope', '$rootScope', '$state', '$timeout', 'UserService', 'campaign',
            function ($scope, $rootScope, $state, $timeout, UserService, campaign) {

                $scope.parentState = 'dhc';
                var user = UserService.principal.getUser();


                if (!campaign) {
                    if(user.campaign){
                        $state.go('dhc.game', { campaignId: user.campaign.id || user.campaign });
                    } else {
                        $state.go('campaign-list.content');
                    }
                }

                $scope.currentCampaign = campaign;
            }]);

}());