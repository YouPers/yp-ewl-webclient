(function () {
    'use strict';

    angular.module('yp.components.user')

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

        .controller('SignupController', [ '$scope', '$rootScope', '$state', '$stateParams', 'UserService', 'yp.config',
            function ($scope, $rootScope, $state, $stateParams, UserService, config) {
                $scope.githubUrl = config.backendUrl + '/auth/github';
                $scope.facebookUrl = config.backendUrl + '/auth/facebook';
            }
        ]);

}());