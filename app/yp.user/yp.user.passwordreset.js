(function () {
    'use strict';


    angular.module('yp.user')


        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
            function ($stateProvider, $urlRouterProvider, accessLevels) {
                $stateProvider
                    .state('requestPasswordReset', {
                        url: "/requestPasswordReset",
                        templateUrl: "yp.user/yp.user.passwordresetrequest.html",
                        controller: "RequestPasswordResetCtrl",
                        access: accessLevels.anonymous,
                        resolve: { }
                    })

                    .state('passwordReset', {
                        url: "/password_reset/:token?firstname&lastname",
                        templateUrl: "yp.user/yp.user.passwordreset.html",
                        controller: "PasswordResetCtrl",
                        access: accessLevels.anonymous,
                        resolve: { }
                    });
            }])


        .controller('PasswordResetCtrl', ['$scope', '$rootScope', 'UserService',
            function ($scope,  $rootScope, UserService) {

                $scope.firstname = $scope.$stateParams.firstname;
                $scope.lastname = $scope.$stateParams.lastname;

                $scope.passwordResetObjReset = function () {
                    $scope.passwordResetObj = {password: '', password2: ''};
                    $scope.$broadcast('formPristine');
                };
                $scope.passwordResetObjReset();

                $scope.passwordReset = function () {
                    UserService.passwordReset($scope.$stateParams.token, $scope.passwordResetObj.password).then(function () {
                        $scope.resetSuccessful = true;
                    }, function (err) {
                        $rootScope.$emit('notification:error', err);
                    });
                };

            }])

        .controller('RequestPasswordResetCtrl', ['$scope', '$rootScope', 'UserService',
            function ($scope, $rootScope, UserService) {


                $scope.passwordResetObjReset = function () {
                    $scope.passwordResetObj = {usernameOrEmail: ''};
                };
                $scope.passwordResetObjReset();

                $scope.requestPasswordReset = function () {
                    UserService.requestPasswordReset($scope.passwordResetObj.usernameOrEmail).then(function () {
                        $scope.requestSent = true;
                    }, function (err) {
                        $rootScope.$emit('notification', 'password.reset');
                    });
                };

            }]);
}());