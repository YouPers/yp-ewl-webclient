(function () {
    'use strict';

    angular.module('yp.components.user')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('signin', {
                        url: "/signin",
                        templateUrl: 'components/user/signin/signin.html',
                        controller: 'SigninController',
                        access: accessLevels.all,
                        resolve: {

                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('components/user/signin/signin');
            }])

        .controller('SigninController', [ '$scope', '$rootScope', '$state', '$stateParams', 'UserService',
            function ($scope, $rootScope, $state, $stateParams, UserService) {

            }
        ]);

}());