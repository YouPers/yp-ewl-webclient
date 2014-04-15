(function () {
    'use strict';

    angular.module('yp.dhc.welcome',
        [
            'restangular',
            'ui.router'
        ])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('welcome', {
                        url: "/welcome/{campaignId}",
                        templateUrl: "dhc/welcome/welcome.html",
                        access: accessLevels.all,
                        resolve: {

                            campaign: ['Restangular', '$stateParams',
                                function (Restangular, $stateParams) {
                                    return Restangular.one('campaigns', $stateParams.campaignId).get().then(function success (campaign) {
                                        return campaign;
                                    });
                                }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/welcome/welcome');
            }])

        .controller('WelcomeController', [ '$scope', '$rootScope', '$state', '$stateParams', 'UserService', 'campaign',
            function ($scope, $rootScope, $state, $stateParams, UserService, campaign) {

                if (!campaign) {
                    $state.go('home.content');
                }

                $scope.join = function () {

                    UserService.principal.getUser().campaign = campaign.id;

                    // if this is an authenticated user (e.g. a stored one, that already exists on the backend)
                    // we need to save it, because we have just updated it.
                    // if it is NOT an authenticated user we cannot save this change at this moment, so we
                    // just leave it in the client principal and store it when the user eventually register on our site.
                    if (UserService.principal.isAuthenticated()) {
                        UserService.putUser(UserService.principal.getUser()).then(function (result){

                            $state.go('home.content');

                        });
                    }

                };

            }
        ]);

}());