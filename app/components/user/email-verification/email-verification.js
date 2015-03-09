(function () {
    'use strict';


    angular.module('yp.components.user')


        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
            function ($stateProvider, $urlRouterProvider, accessLevels) {
                $stateProvider
                    .state('emailVerification', {
                        url: "/email_verification/:token",
                        templateUrl: "components/user/email-verification/email-verification.html",
                        controller: "EmailVerificationCtrl",
                        access: accessLevels.individual,
                        resolve: { }
                    });
            }])

        .controller('EmailVerificationCtrl', ['$scope', 'UserService', '$window',
            function ($scope, UserService, $window) {

                UserService.verifyEmail($scope.principal.getUser().id, $scope.$stateParams.token).then(function (result) {
                    $scope.emailValid = true;
                    UserService.principal.getUser().emailValidatedFlag = true;
                }, function (err) {
                    // the only possible good case why the token is not valid would be that a different user is already logged in
                    UserService.logout();
                    $scope.$state.go('signin');
                });

            }]);


}());