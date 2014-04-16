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

        .controller('SignupController', [ '$scope', '$rootScope', '$state', '$stateParams', 'UserService',
            function ($scope, $rootScope, $state, $stateParams, UserService) {

                $scope.user = {};

                $scope.$watchCollection('[user.firstname, user.lastname]', function () {
                    if ($scope.registerform && !$scope.registerForm.username.$dirty && $scope.user.firstname) {
                        $scope.result.newuser.username = ($scope.result.newuser.firstname.substr(0, 1) || '').toLowerCase() + ($scope.result.newuser.lastname || '').toLowerCase();
                    }
                });

                $scope.submit = function() {

                    var user = $scope.user;

                    UserService.submitNewUser(user).then(function (newUser) {
                        UserService.login(UserService.encodeCredentials(user.username, user.password)).then(function() {
                            if ($scope.nextStateAfterLogin) {
                                $scope.$state.go($scope.nextStateAfterLogin.toState, $scope.nextStateAfterLogin.toParams);
                            } else {
                                $state.go('home.content');
                            }
                        });
                    });
                }
            }
        ]);

}());