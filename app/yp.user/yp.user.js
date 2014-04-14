(function () {
    'use strict';



    angular.module('yp.user', ['ui.router', 'restangular', 'Base64', 'yp.config', 'ngCookies', 'angularFileUpload'])

        // authentication
        // ==============
        // Provides the interface for conversing with the authentication API and
        // generating a principal from the authenticated entity's information.

        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('yp.user/yp.user');
        }])

        .run(['enums', function (enums) {
            _.merge(enums, {
                maritalStatus: [
                    'undefined',
                    'single',
                    'unmarried',
                    'married',
                    "separated",
                    "divorced",
                    "widowed"
                ],
                gender: [
                    "undefined",
                    "male",
                    "female"
                ],
                timezone: [
                    '00:00',
                    '+01:00',
                    '+03:00'
                ]
            });
        }])

        .controller('MenuLoginCtrl', [ '$scope', 'UserService', '$location', '$modal', '$window',
            function ($scope, UserService, $location, $modal, $window) {


                $scope.logout = function () {
                    UserService.logout();
                    $location.path('/');
                };


                $scope.$on('event:authority-authorized', function (event, data) {
                    if ($scope.nextStateAfterLogin) {
                        $scope.$state.go($scope.nextStateAfterLogin.toState, $scope.nextStateAfterLogin.toParams);
                        $scope.nextStateAfterLogin = null;
                    }
                });

            }]);

}());
