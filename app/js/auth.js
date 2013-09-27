(function () {
    'use strict';


    // Private variable for storing identity information.
    var _currentUser = {},

    // Stores whether the user has been authenticated
        _authenticated = false,

        userRoles = {
            anonymous: 1,
            individual: 2,
            healthpromoter: 4,
            admin: 8
        };



    angular.module('yp.auth', ['ui.router', 'restangular'])

    // authentication
    // ==============
    // Provides the interface for conversing with the authentication API and
    // generating a principal from the authenticated entity's information.

        // Properties
        // ----------
        // Version
        .constant('version', '0.0.1')

        // authorization levels and user Roles
        .constant('userRoles', userRoles)

        .constant('accessLevels', {
            all: userRoles.anonymous | // 1111
                userRoles.individual |
                userRoles.healthpromoter |
                userRoles.admin,
            anononymous: userRoles.anonymous,  // 1000  nur zugänglich,  wenn nicht eingeloggt
            individual: userRoles.individual |   // 0101
                userRoles.admin,
            healthpromoter: userRoles.healthpromoter  | // 0011
                userRoles.admin,
            admin: userRoles.admin  // 0001
        })


        // principal
        // ---------
        // The authenticated entity.
        .factory('principal', function () {
            return {
                getUser: function () {
                    return _currentUser;
                },
                isAuthenticated: function () {
                    return _authenticated;
                },
                isAuthorized: function(reqAccessLevel, userRole) {
                    var currentUserRole = userRoles.anonymous;
                    if (userRole) {
                        currentUserRole = userRole;
                    } else if (_currentUser && ('role' in _currentUser)) {
                        currentUserRole = _currentUser.role;
                    }
                    return reqAccessLevel & currentUserRole;
                }

            };
        })

        // authority
        // ---------
        // The `authority` provides a means for authentication
        .provider('authority', function () {

            // Define the provider's instance
            this.$get = ['$rootScope',
                function ($rootScope) {

                    return {
                        // `authorize` is meant to be called from a controller once the
                        // user has been authenticated by an external API. It wires up the
                        // `principal.identity()` object and then broadcasts the
                        // `authority-authorized` event from the `$rootScope`
                        authorize: function (currentUser) {
                            // check argument and mandatory keys
                            if (!(currentUser && ('username' in currentUser) && ('role' in currentUser) && ('id' in currentUser))) {
                                throw new Error('Authorize user: incorrect type: ' + angular.toJSON(currentUser));
                            }

                            _authenticated = true;
                            _currentUser = currentUser;

                            // Broadcast the authorized event
                            $rootScope.$broadcast('event:authority-authorized');
                        },

                        // `deauthorize` resets the `principal` and `identity`
                        deauthorize: function () {
                            _authenticated = false;
                            _currentUser = null;

                            // Broadcast the deauthorized event
                            $rootScope.$broadcast('event:authority-deauthorized');
                        }

                    };
                }];
        })



        .factory("yp.user.UserService", ['userRoles', '$cookieStore', 'authority', '$rootScope', 'Restangular', '$state',
            function (userRoles, $cookieStore, authority, $rootScope, Rest, $state) {
                var getNewUUID = function () {
                    return 'asdfaf32241234';
                };
                var users = Rest.all('users');


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
                        users.post(newuser).then(function () {
                            $rootScope.$broadcast('globalUserMsg', 'New Account successfully created', 'success', 3000);
                        }).then(successCallback);
                    }
                };

                var credentialsFromCookie = $cookieStore.get('authdata');

                if (credentialsFromCookie) {
                    UserService.fakeLogin(credentialsFromCookie, function () {
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
                    if ($scope.nextStateAfterLogin) {
                        $state.go($scope.nextStateAfterLogin.toState, $scope.nextStateAfterLogin.toParams);
                    }
                });


                $scope.loginSubmit = function () {
                    // loginBasicAuth();
                    UserService.fakeLogin(UserService.encodeCredentials($scope.username, $scope.password), function () {
                        $scope.username = '';
                        $scope.password = '';
                        $scope.showLoginDialog = false;
                        $scope.showRegistrationForm = false;
                    });
                };

                $scope.logout = function () {
                    UserService.logout();
                };

                $scope.getUsername = function () {
                    if ($scope.principal.isAuthenticated()) {
                        return $scope.principal.identity.username;
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
}());
