(function () {
    'use strict';

    angular.module('yp.user.signup', [])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('signup', {
                        templateUrl: "layout/single-column.html",
                        access: accessLevels.all
                    })
                    .state('signup.content', {
                        url: "/signup",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'components/user/signup/signup.html',
                                controller: 'SignupController'
                            }
                        },
                        resolve: {

                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('components/user/signup/signup');
            }])

        .controller('SignupController', [ '$scope', '$rootScope', '$state', '$stateParams', 'UserService', '$analytics',
            function ($scope, $rootScope, $state, $stateParams, UserService, $analytics) {

                $analytics.pageTrack('/signup');

            }
        ]);

}());