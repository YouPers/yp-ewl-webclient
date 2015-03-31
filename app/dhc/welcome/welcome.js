(function () {
    'use strict';

    angular.module('yp.dhc')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('welcome', {
                        url: "/welcome/{campaignId}/{preview}",
                        templateUrl: "dhc/welcome/welcome.html",
                        controller: 'WelcomeController',
                        access: accessLevels.all,
                        resolve: {

                            campaign: ['CampaignService', '$stateParams',
                                function (CampaignService, $stateParams) {
                                    return CampaignService.getCampaign($stateParams.campaignId);
                                }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/welcome/welcome');
            }])

        .controller('WelcomeController', [ '$scope', '$rootScope', '$state', '$stateParams', 'UserService', 'ActivityService', 'campaign', 'HealthCoachService', 'CampaignService',
            function ($scope, $rootScope, $state, $stateParams, UserService, ActivityService, campaign, HealthCoachService, CampaignService) {

                var userIsAlreadyInThisCampaign = UserService.principal.getUser().campaign &&
                    UserService.principal.getUser().campaign.id === campaign.id;
                var campaignHasStarted = $scope.campaignHasStarted = moment().isAfter(moment(campaign.start));


                if (!campaign) {
                    $state.go('dhc.game', {view: ""});
                }  else if(!$stateParams.preview && userIsAlreadyInThisCampaign && campaignHasStarted) {
                    // user is already in this campaign
                    $state.go('dhc.game', {campaignId: campaign.id, view: ""});
                } else {
                    $scope.campaign = campaign;
                }

                $scope.isCampaignLead = CampaignService.isCampaignLead(campaign);

                $scope.join = function () {

                    UserService.principal.getUser().campaign = campaign;

                    // if this is an authenticated user (e.g. a stored one, that already exists on the backend)
                    // we need to save it, because we have just updated it.
                    // if it is NOT an authenticated user we cannot save this change at this moment, so we
                    // just leave it in the client principal and store it when the user eventually register on our site.

                    HealthCoachService.queueEvent('campaignWelcome');

                    if (UserService.principal.isAuthenticated()) {
                        UserService.putUser(UserService.principal.getUser()).then(function (result){
                            // TODO: queue a coach message dhc.game.campaignWelcome
                            // with the existing text of dhc.hame.noOffers
                            // remove noOffers
                            $state.go('dhc.game', {campaignId: campaign.id, view: ""});
                        });
                    } else {
                        // user is not authenticated, we redirect him to signUp / signIn
                        $rootScope.nextStateAfterLogin = {toState: 'homedispatcher', toParams: {campaignId: campaign.id, view: ""}};
                        $state.go('signup');
                    }

                };

            }
        ]);

}());