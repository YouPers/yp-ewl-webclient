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
                    templateUrl: "layout/default.html",
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
                $rootScope.$log.log('DhcController is run now.');
                $scope.parentState = 'dhc';

                // there was no campaign in the URL of this dhc.* state, so we try to get the campaign of the current
                // user and redirect
                if (!campaign) {
                    if(user.campaign){
                        $rootScope.$log.log('DhcController: redirecting to dhc.game (no campaign in URL');
                        $state.go('dhc.game', { campaignId: user.campaign.id || user.campaign , view: ""});

                    } else {
                        // the user has no user.campaign and in the URL was no campaign.
                        // should never happen...
                        $rootScope.$log.log('DhcController: redirecting to error(no campaign in URL, no campaign on user)');
                        $rootScope.$emit('clientmsg:error', "DhcButNoCampaign", {duration: 10000});
                        UserService.logout();
                    }
                } else {
                    // check whether the current user is not a member of another campaign than the one he is trying to navigate to
                    // if yes, redirect to his home state
                    if (user.campaign && user.campaign.id !== campaign.id) {
                        $rootScope.$emit('clientmsg:error', 'memberOfOtherCampaign', {duration: 10000});
                        return $state.go('dhc.game', {campaignId: user.campaign.id});
                    }



                    // last 2 days of the users campaign -> redirect non-campaignAdmins to dhc end of campaign
                    // if endOfCampaignDisplayed has not been set yet, or it is more than 1 day in the past
                    if(!$rootScope.isCampaignAdmin &&
                        (!user.endOfCampaignDisplayed || moment().diff(user.endOfCampaignDisplayed, 'days') > 1) &&
                        moment().businessDiff(campaign.end) >= -2) {
                        user.endOfCampaignDisplayed = moment();
                        $rootScope.$log.log('DhcController: redirecting end of campaign');
                        return $state.go('dhc.end-of-campaign', { campaignId: campaign.id });
                    }

                }
            }]);

}());