(function () {
    'use strict';


    angular.module('yp.email-verification', ['restangular'])


        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
            function ($stateProvider, $urlRouterProvider, accessLevels) {
                $stateProvider
                    .state('emailVerification', {
                        url: "/email_verification/:token",
                        templateUrl: "partials/email.verification.html",
                        controller: "EmailVerificationCtrl",
                        access: accessLevels.all,
                        resolve: {

                        }
                    });
            }])
        .factory('EmailVerificationService', ['$http', 'Restangular', 'principal', function ($http, Restangular, principal) {

            var users = Restangular.one("users", principal.getUser().id);

            var emailVerificationService = {

                verify: function (token) {
                    return users.post("email_verification", {token: token});
                }
            };

            return emailVerificationService;


        }])

        .controller('EmailVerificationCtrl', ['$scope', 'EmailVerificationService', 'principal', '$state', function ($scope, EmailVerificationService, principal, $state) {
            $scope.principal = principal;

            EmailVerificationService.verify($state.params.token).then(function (result) {
                $scope.result = result;
            });;

        }]);

}());

