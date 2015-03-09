(function () {
    'use strict';

    angular.module('yp.components.user')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('signup', {
                        url: "/signup",
                        templateUrl: 'components/user/signup/signup.html',
                        controller: 'SignupController',
                        access: accessLevels.all,
                        resolve: {

                        }
                    })
                    .state('signupFinalization', {
                        url: "/signup/finalize",
                        templateUrl: 'components/user/signup/signup-finalization.html',
                        controller: 'SignupFinalizationController',
                        access: accessLevels.all,
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
        ])
        .controller('SignupFinalizationController', [ '$scope', '$rootScope', '$state', '$stateParams', 'UserService', 'yp.config',
            function ($scope, $rootScope, $state, $stateParams, UserService, config) {

                var user = UserService.principal.getUser();
                $scope.translateValues = { email: user.email };
                $scope.sendVerificationEmail = function () {
                    $scope.verificationSent = false;
                    UserService.sendVerificationEmail(user.id).then(function () {
                        $scope.verificationSent = true;
                    });
                };
                $scope.signUp = function () {

                    var campaign = user.campaign;

                    UserService.logout().then(function () {
                        UserService.principal.getUser().campaign = campaign;
                        $state.go('signup');
                    });

                };
            }
        ]);

}());