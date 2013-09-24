"use strict";

angular.module('yp.user', ['ui.router', 'authentication', 'restangular'])


    .factory("yp.user.UserService", ['userRoles', '$cookieStore', 'authority', '$rootScope', 'Restangular', '$state',
        function (userRoles, $cookieStore, authority, $rootScope, Rest, $state) {
            var getNewUUID = function () {
                return 'asdfaf32241234';
            };
            var users = Rest.all('api/users');


            var UserService = {
                encodeCredentials: function (username, password) {
                    return ({username: username, password: password});
                },
                fakeLogin: function (cred, successCallback) {
                    users.getList().then(function (knownUsers) {
                            var foundUser = _.find(knownUsers, function (value, key) {
                                return value.username === cred.username;
                            });
                            if ((foundUser) && (cred.password)) {
                                // $http.defaults.headers.common.Authorization = 'Basic ' + username;
                                $cookieStore.put('authdata', cred);
                                authority.authorize(foundUser);
                                if (successCallback) {
                                    successCallback();
                                }
                            } else {
                                $rootScope.$broadcast('globalUserMsg', 'Login / password not valid, please try again or register', 'danger', 3000);
                            }
                        }
                    );
                },
                logout: function () {
                    $cookieStore.remove('authdata');
                    // $http.defaults.headers.common.Authorization = '';
                    authority.deauthorize();
                },
                submitNewUser: function (newuser, successCallback) {
                    newuser.id = getNewUUID();
                    newuser.role = userRoles.user;
                    newuser.fullname = newuser.firstname + ' ' + newuser.lastname;
                    users.post(newuser).then(successCallback);
                }
            };

            var credentialsFromCookie = $cookieStore.get('authdata');

            if (credentialsFromCookie) {
                UserService.fakeLogin(credentialsFromCookie, function() {
                    $state.go('cockpit');
                });
            }

            return UserService;
        }])

    .controller('yp.user.MenuLoginCtrl', [ '$scope', 'yp.user.UserService', '$state', function ($scope, UserService, $state) {

        $scope.loginSubmit = function () {
            UserService.fakeLogin(UserService.encodeCredentials($scope.username, $scope.password), function () {
                $scope.username = '';
                $scope.password = '';
                $state.go('cockpit');
            });
        };

        $scope.logout = function () {
            UserService.logout();
        };


    }])

    .controller('yp.user.DialogLoginRegisterCtrl', ['$scope', '$rootScope', '$state', 'yp.user.UserService',
        function ($scope, $rootScope, $state, UserService) {

            $scope.$on('loginMessageShow', function (event, data) {
                $scope.showLoginDialog = true;
                $scope.nextStateAfterLogin = data;
            });

            $scope.$on('event:authority-authorized', function (event, data) {
                $scope.showLoginDialog = false;
            });


            $scope.loginSubmit = function () {
                // loginBasicAuth();
                UserService.fakeLogin(UserService.encodeCredentials($scope.username, $scope.password), function () {
                    $scope.username = '';
                    $scope.password = '';
                    if ($scope.nextStateAfterLogin) {
                        $state.go($scope.nextStateAfterLogin.toState, $scope.nextStateAfterLogin.toParams);
                        $scope.nextStateAfterLogin = null;
                    } else {
                        $state.go('cockpit');
                    }
                    $scope.showLoginDialog = false;
                    $scope.showRegistrationForm = false;
                });
            };

            $scope.logout = function () {
                UserService.logout();
            };

            $scope.getUsername = function () {
                if ($scope.principal.isAuthenticated()) {
                    return $scope.principal.identity().name();
                } else {
                    return '';
                }
            };

            $scope.newuser = {};

            $scope.registrationSubmit = function () {
                UserService.submitNewUser($scope.newuser, function () {
                    UserService.fakeLogin(UserService.encodeCredentials($scope.newuser.username, $scope.newuser.password), function () {
                        if ($scope.nextStateAfterLogin) {
                            $state.go($scope.nextStateAfterLogin.toState, $scope.nextStateAfterLogin.toParams);
                            $scope.nextStateAfterLogin = null;
                        } else {
                            $state.go('cockpit');
                        }
                    });
                });
                $scope.showLoginDialog = false;
                $scope.showRegistrationForm = false;
            };

            $scope.$watchCollection('[newuser.firstname, newuser.lastname]', function () {
                if (!$scope.registerform.username.$dirty && $scope.newuser.firstname) {
                    $scope.newuser.username = ($scope.newuser.firstname.substr(0, 1) || '').toLowerCase() + ($scope.newuser.lastname || '').toLowerCase();
                }

            });
        }]);
