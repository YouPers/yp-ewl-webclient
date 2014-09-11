(function () {
    'use strict';

    angular.module('yp.dcm')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('dcmSignup', {
                        templateUrl: "layout/dcm-default.html",
                        access: accessLevels.all
                    })
                    .state('dcmSignup.content', {
                        url: "/dcm/signup",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dcm/signup/signup.html',
                                controller: 'DcmSignupController as dcmSignupController'
                            }
                        },
                        resolve: {

                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/signup/signup');
            }])

        .controller('DcmSignupController', [ '$scope', '$rootScope', '$timeout', '$state', 'UserService', 'OrganizationService',
            function ($scope, $rootScope, $timeout, $state, UserService, OrganizationService) {


                $scope.submit = function () {

                    var user = $scope.newUser;
                    delete user.username;

                    UserService.submitNewUser(user).then(function (newUser) {
                        var keepMeLoggedIn = true;
                        UserService.login(UserService.encodeCredentials(user.username, user.password), keepMeLoggedIn).then(function() {

                            OrganizationService.postOrganization({
                                name: user.organizationName
                            }).then(function (savedOrganization) {

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

