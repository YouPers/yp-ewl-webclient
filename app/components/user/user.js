(function () {
    'use strict';

    angular.module('yp.components.user',
            [
                'ui.router',
                'restangular',
                'ipCookie',
                'angularFileUpload',

                'yp.components.util',
                'yp.config'
            ])

        // authentication
        // ==============
        // Provides the interface for conversing with the authentication API and
        // generating a principal from the authenticated entity's information.

        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('components/user/user');
        }])

        .run(['$rootScope', function ($rootScope) {
            $rootScope.enums = _.merge($rootScope.enums || {}, {
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
                ],
                weekday: [
                    'MO',
                    'TU',
                    'WE',
                    'TH',
                    'FR',
                    'SA',
                    'SU'
                ]
            });
        }])

        .controller('MenuLoginCtrl', [ '$scope', 'UserService', '$location', '$modal', '$window',
            function ($scope, UserService, $location, $modal, $window) {


                $scope.logout = function () {
                    UserService.logout().then(function() {
                        $window.location = '/';
                    });
                };


                $scope.$on('event:authority-authorized', function (event, data) {
                    if ($scope.nextStateAfterLogin) {
                        $scope.$state.go($scope.nextStateAfterLogin.toState, $scope.nextStateAfterLogin.toParams);
                        $scope.nextStateAfterLogin = null;
                    }
                });

            }]);

}());
