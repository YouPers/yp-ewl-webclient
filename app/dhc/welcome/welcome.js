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
                        templateUrl: "dhc/welcome/welcome.html",
                        access: accessLevels.all
                    })
                    .state('welcome.content', {
                        url: "/welcome",
                        access: accessLevels.all,
                        resolve: {

                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/welcome/welcome');
            }])

        .controller('WelcomeController', [ '$scope', '$rootScope', 'CampaignService',
            function ($scope, $rootScope, CampaignService) {

                CampaignService.getCampaign('527916a82079aa8704000006').then(function(campaign) {

                    $scope.campaign = campaign;
                });

            }
        ]);

}());