(function () {
    'use strict';

    angular.module('yp.user.signin', [])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('signin', {
                        templateUrl: "layout/single-column.html",
                        access: accessLevels.all
                    })
                    .state('signin.content', {
                        url: "/signin",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'components/user/signin/signin.html',
                                controller: 'SigninController'
                            }
                        },
                        resolve: {

                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('components/user/signin/signin');
            }])

        .controller('SigninController', [ '$scope', '$rootScope', '$state', '$stateParams', 'UserService', '$analytics',
            function ($scope, $rootScope, $state, $stateParams, UserService, $analytics) {

                $analytics.pageTrack('/signin');

            }
        ]);

}());