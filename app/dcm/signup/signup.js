(function () {
    'use strict';

    angular.module('yp.dcm')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('dcmSignup', {
                        url: "/dcm/signup",
                        access: accessLevels.all,
                        templateUrl: 'dcm/signup/signup.html',
                        controller: 'DcmSignupController as dcmSignupController',
                        resolve: {},
                        onEnter: ['$state', '$window', 'UserService', function ($state, $window, UserService) {

                            if (UserService.principal.isAuthenticated()) { // redirect to home if the user is already logged in
                                $state.go('dcm.home');
                            }
                        }]
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/signup/signup');
            }])

        .controller('DcmSignupController', ['$scope', '$rootScope', '$timeout', '$state', 'UserService', 'OrganizationService',
            function ($scope, $rootScope, $timeout, $state, UserService, OrganizationService) {

                $scope.healthCoachEvent = 'stateEnter';
                $scope.submit = function () {

                    var user = $scope.newUser;
                    delete user.username;

                    UserService.submitNewUser(user).then(function (newUser) {
                        var keepMeLoggedIn = true;
                        UserService.login(UserService.encodeCredentials(user.username, user.password), keepMeLoggedIn).then(function () {

                            OrganizationService.postOrganization({
                                name: user.organizationName
                            }).then(function (savedOrganization) {

                                UserService.principal.getUser().roles.push('orgadmin');

                                if ($rootScope.nextStateAfterLogin) {
                                    $state.go($rootScope.nextStateAfterLogin.toState, $rootScope.nextStateAfterLogin.toParams);
                                } else {
                                    $state.go('dcm.home');
                                }
                            });

                        });
                    });
                };

            }]);
}());

