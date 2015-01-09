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

                    onEnter: ['$rootScope', '$state', '$stateParams', 'campaign', 'UserService', function($rootScope, $state, $stateParams, campaign, UserService){
                    }]
                });


        }])

        .controller('DhcController', ['$scope', '$rootScope', '$state', '$timeout', 'UserService', 'campaign',
            function ($scope, $rootScope, $state, $timeout, UserService, campaign) {
                var user = UserService.principal.getUser();
                console.log('DhcController is run now.');

                if (!campaign) {
                    if(user.campaign){
                        console.log('DhcController: redirecting to dhc.game (no campaign in URL');
                        $state.go('dhc.game', { campaignId: user.campaign.id || user.campaign , view: ""});

                    } else {
                        console.log('DhcController: redirecting to campaign list(no campaign in URL, no campaign on user');
                        $state.go('campaign-list.content');
                    }
                } else {
                    // last 2 days of the users campaign -> redirect non-campaignAdmins to dhc end of campaign
                    // if endOfCampaignDisplayed has not been set yet, or it is more than 1 day in the past
                    if(!$rootScope.isCampaignAdmin &&
                        (!user.endOfCampaignDisplayed || moment().diff(user.endOfCampaignDisplayed, 'days') > 1) &&
                        moment().businessDiff(campaign.end) >= -2) {
                        user.endOfCampaignDisplayed = moment();
                        console.log('DhcController: redirecting end of campaign');
                        return $state.go('dhc.end-of-campaign', { campaignId: campaign.id });
                    }

                }
            }]);

}());