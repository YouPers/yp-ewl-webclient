(function () {
    'use strict';


    angular.module('yp.user', ['restangular'])


        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
            function ($stateProvider, $urlRouterProvider, accessLevels) {
                $stateProvider
                    .state('account', {
                        url: "/account",
                        templateUrl: "partials/user.account.html",
                        controller: "UserAccountCtrl",
                        access: accessLevels.individual,
                        resolve: { }
                    })

                    .state('emailVerification', {
                        url: "/email_verification/:token",
                        templateUrl: "partials/email.verification.html",
                        controller: "EmailVerificationCtrl",
                        access: accessLevels.individual,
                        resolve: {

                        }
                    })

                .state('requestPasswordReset', {
                    url: "/requestPasswordReset",
                    templateUrl: "partials/user.requestpasswordreset.html",
                    controller: "RequestPasswordResetCtrl",
                    access: accessLevels.anonymous,
                    resolve: {

                    }
                })

                .state('passwordReset', {
                    url: "/password_reset/:token?firstname&lastname",
                    templateUrl: "partials/user.passwordreset.html",
                    controller: "PasswordResetCtrl",
                    access: accessLevels.anonymous,
                    resolve: {

                    }
                });
            }])


        .controller('UserAccountCtrl', ['$scope', '$rootScope', 'principal', 'authority', 'yp.user.UserService',
            function ($scope, $rootScope, principal, authority, UserService) {
                $scope.principal = principal;


                $scope.accountUserObjReset = function () {
                    $scope.accountUserObj = _.clone(principal.getUser());
                };
                $scope.accountUserObjReset();


                $scope.saveAccount = function () {
                    UserService.putUser($scope.accountUserObj).then(function (user) {
                        authority.authorize(user);
                        $rootScope.$broadcast('globalUserMsg', 'Your account has been saved', 'success', 3000);
                    });

                };

                $scope.passwordUserObjReset = function () {
                    $scope.passwordUserObj = _.clone(principal.getUser());
                };
                $scope.passwordUserObjReset();

                $scope.changePassword = function () {
                    UserService.putUser($scope.passwordUserObj).then(function (user) {

                        UserService.login($scope.passwordUserObj, function () {

                            $scope.passwordUserObjReset();
                            $scope.$broadcast('formPristine');

                            $rootScope.$broadcast('globalUserMsg', 'Your password has been changed', 'success', 3000);
                        });
                    }, function (err) {
                        $rootScope.$broadcast('globalUserMsg', "Current password is invalid", 'danger', 3000);
                    });
                };
            }])

        .controller('EmailVerificationCtrl', ['$scope', '$state', 'yp.user.UserService', '$window',
            function ($scope, $state, UserService, $window) {

                UserService.verifyEmail($scope.principal.getUser().id, $state.params.token).then(function (result) {
                    $scope.emailValid = true;
                }, function (err) {
                    // the only possible good case why the token is not valid would be that a different user is already logged in
                    UserService.logout();
                    $window.location.reload();
                });

            }])

    .controller('PasswordResetCtrl', ['$scope', '$state','$rootScope', 'authority', 'yp.user.UserService',
        function ($scope, $state, $rootScope, authority, UserService) {

            $scope.firstname = $state.params.firstname;
            $scope.lastname = $state.params.lastname;

            $scope.passwordResetObjReset = function () {
                $scope.passwordResetObj = {password: '', password2: ''};
                $scope.$broadcast('formPristine');
            };
            $scope.passwordResetObjReset();

            $scope.passwordReset = function () {
                UserService.passwordReset($state.params.token, $scope.passwordResetObj.password ).then(function () {
                    $scope.resetSuccessful = true;
                }, function (err) {
                    $rootScope.$broadcast('globalUserMsg', "Passwort konnte nicht gesetzt werden.", 'danger', 3000);
                });
            };

        }])

    .controller('RequestPasswordResetCtrl', ['$scope', '$rootScope', 'authority', 'yp.user.UserService',
        function ($scope, $rootScope, authority, UserService) {


            $scope.passwordResetObjReset = function () {
                $scope.passwordResetObj = {usernameOrEmail: ''};
            };
            $scope.passwordResetObjReset();

            $scope.requestPasswordReset = function () {
                UserService.requestPasswordReset($scope.passwordResetObj.usernameOrEmail).then(function () {
                    $scope.requestSent = true;
                }, function (err) {
                    $rootScope.$broadcast('globalUserMsg', "Dieser Username/Email ist uns nicht bekannt", 'danger', 3000);
                });
            };

        }]);

        }());