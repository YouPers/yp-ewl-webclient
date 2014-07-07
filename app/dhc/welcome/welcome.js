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

        .controller('WelcomeController', [ '$scope', '$rootScope', '$state', '$stateParams', 'UserService', 'ActivityService', 'campaign',
            function ($scope, $rootScope, $state, $stateParams, UserService, ActivityService, campaign) {

                if (!campaign) {
                    $state.go('game.content');
                } else if(!$stateParams.preview && UserService.principal.getUser().campaign && UserService.principal.getUser().campaign.id === campaign.id) {
                    // user is already in this campaign
                    $state.go('game.content');
                } else {
                    $scope.campaign = campaign;
                }

                $scope.join = function () {

                    UserService.principal.getUser().campaign = campaign;

                    // if this is an authenticated user (e.g. a stored one, that already exists on the backend)
                    // we need to save it, because we have just updated it.
                    // if it is NOT an authenticated user we cannot save this change at this moment, so we
                    // just leave it in the client principal and store it when the user eventually register on our site.
                    if (UserService.principal.isAuthenticated()) {
                        UserService.putUser(UserService.principal.getUser()).then(function (result){

                            var assessmentIdeaId = '5278c6accdeab69a25000008';

                            ActivityService.getIdea(assessmentIdeaId).then(function (idea) {
                                var activity = idea.getDefaultPlan();
                                ActivityService.savePlan(activity);
                            });

                            $state.go('game.content');

                        });
                    } else {
                        $state.go('game.content');
                    }

                };

            }
        ]);

}());