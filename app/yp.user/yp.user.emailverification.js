(function () {
    'use strict';


    angular.module('yp.user')


        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
            function ($stateProvider, $urlRouterProvider, accessLevels) {
                $stateProvider
                    .state('emailVerification', {
                        url: "/email_verification/:token",
                        templateUrl: "yp.user/yp.user.emailverification.html",
                        controller: "EmailVerificationCtrl",
                        access: accessLevels.individual,
                        resolve: { }
                    });
            }])

        .controller('EmailVerificationCtrl', ['$scope', 'UserService', '$window',
            function ($scope, UserService, $window) {

                UserService.verifyEmail($scope.principal.getUser().id, $scope.$stateParams.token).then(function (result) {
                    $scope.emailValid = true;
                }, function (err) {
                    // the only possible good case why the token is not valid would be that a different user is already logged in
                    UserService.logout();
                    $window.location.reload();
                });

            }]);


}());