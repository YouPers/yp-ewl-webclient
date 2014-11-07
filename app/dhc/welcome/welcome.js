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
                    })
                    .state('moreinfo', {
                        templateUrl: "layout/single-column.html",
                        access: accessLevels.all,
                        controller: ['$scope','$window', function($scope, $window) {
                            $scope.close = function() {
                                $window.close();
                            };
                        }]
                    })
                    .state('moreinfo.content', {
                        url: "/moreinfo",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dhc/welcome/moreinfo.html'
                            }
                        },
                        resolve: {

                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/welcome/welcome');
            }])

        .controller('WelcomeController', [ '$scope', '$rootScope', '$state', '$stateParams', 'UserService', 'ActivityService', 'campaign',
            function ($scope, $rootScope, $state, $stateParams, UserService, ActivityService, campaign) {

                if (!campaign) {
                    $state.go('dhc.game', {view: ""});
                } else if ($scope.principal.isAuthorized('campaignlead')) {
                    $scope.isCampaignlead = true;
                } else if(!$stateParams.preview && UserService.principal.getUser().campaign && UserService.principal.getUser().campaign.id === campaign.id) {
                    // user is already in this campaign
                    $state.go('dhc.game', {view: ""});
                } else {
                    $scope.campaign = campaign;
                }

                $scope.campaignHasStarted = moment().isAfter(moment(campaign.start));

                $scope.join = function () {

                    UserService.principal.getUser().campaign = campaign;

                    // if this is an authenticated user (e.g. a stored one, that already exists on the backend)
                    // we need to save it, because we have just updated it.
                    // if it is NOT an authenticated user we cannot save this change at this moment, so we
                    // just leave it in the client principal and store it when the user eventually register on our site.
                    if (UserService.principal.isAuthenticated()) {
                        UserService.putUser(UserService.principal.getUser()).then(function (result){
                            $state.go('dhc.game', {campaignId: campaign.id, view: ""});
                        });
                    } else {
                        // user is not authenticated, we redirect him to signUp / signIn
                        $state.go('signup.content');
                    }

                };

            }
        ]);

}());