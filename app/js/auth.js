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


    angular.module('yp.auth', ['ui.router', 'restangular', 'Base64'])

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
            healthpromoter: userRoles.healthpromoter | // 0011
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
                isAuthorized: function (reqAccessLevel, userRole) {
                    var currentUserRole = userRoles.anonymous;
                    if (userRole) {
                        currentUserRole = userRole;
                    } else if (_currentUser && ('role' in _currentUser)) {
                        currentUserRole = userRoles[_currentUser.role];
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
                                throw new Error('Authorize user: incorrect type: ' + angular.toJson(currentUser));
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


        .factory("yp.user.UserService", ['userRoles', '$cookieStore', 'authority', '$rootScope', 'Restangular', '$location', '$http', 'base64codec',
            function (userRoles, $cookieStore, authority, $rootScope, Rest, $location, $http, base64codec) {
                var users = Rest.all('users');
                var login = Rest.all('login');

                var UserService = {
                    encodeCredentials: function (username, password) {
                        return ({username: username, password: password});
                    },
                    login: function (cred, successCallback) {
                        $http.defaults.headers.common.Authorization = 'Basic ' + base64codec.encode(cred.username + ':' + cred.password);

                        login.post({username: cred.username}).then(function success(result) {
                            $cookieStore.put('authdata', cred);
                            authority.authorize(result);
                            if (successCallback) {
                                successCallback();
                            }

                        }, function error(err) {
                            var msg;
                            if (err && err.status === 0) {
                                msg = 'YouPers Backend Server not reachable, please try again later, Code: ' + err.status;
                            } else {
                                msg = 'Login / password not valid, please try again or register, Code: ' + err.status;
                            }
                            $rootScope.$broadcast('globalUserMsg', msg, 'danger', 3000);
                        });
                    },
                    logout: function () {
                        $cookieStore.remove('authdata');
                        // $http.defaults.headers.common.Authorization = '';
                        authority.deauthorize();
                    },
                    submitNewUser: function (newuser, successCallback) {
                        newuser.role = 'individual';
                        newuser.fullname = newuser.firstname + ' ' + newuser.lastname;
                        users.post(newuser).then(function () {
                            $rootScope.$broadcast('globalUserMsg', 'New Account successfully created', 'success', 3000);
                        }).then(successCallback);
                    },
                    putUser: function (user) {
                        //TODO: does not yet work users.one(user.id).put(user.);
                    }
                };

                var credentialsFromCookie = $cookieStore.get('authdata');

                if (credentialsFromCookie) {
                    var targetLocation = $location.path();
                    $location.path('/');
                    UserService.login(credentialsFromCookie, function () {
                        if (targetLocation === '/home') {
                            $location.path('/cockpit');
                        } else {
                            $location.path(targetLocation);
                        }
                    });
                }

                return UserService;
            }])

        .controller('yp.user.MenuLoginCtrl', [ '$scope', 'yp.user.UserService', '$location', '$modal',
            function ($scope, UserService, $location, $modal) {

                var loginDialogOpen = function () {
                    var modalInstance = $modal.open({
                        templateUrl: 'partials/loginDialog.html',
                        controller: 'yp.user.DialogLoginRegisterCtrl',
                        backdrop: true
                    });

                    modalInstance.result.then(function (result) {
                        if (result.login) {
                            UserService.login(UserService.encodeCredentials(result.login.username, result.login.password));
                        } else if (result.newuser) {
                            UserService.submitNewUser(result.registration.newuser, function () {
                                UserService.login(UserService.encodeCredentials(result.registration.newuser.username, result.registration.newuser.password));
                            });
                        } else {

                        }
                    });
                };

                $scope.loginSubmit = function () {
                    UserService.login(UserService.encodeCredentials($scope.username, $scope.password), function () {
                        $scope.username = '';
                        $scope.password = '';
                    });
                };

                $scope.logout = function () {
                    UserService.logout();
                    $location.path("/");
                };

                $scope.$on('loginMessageShow', function (event, data) {
                    loginDialogOpen();
                    $scope.nextStateAfterLogin = data;
                });

                $scope.$on('event:authority-authorized', function (event, data) {
                    if ($scope.nextStateAfterLogin) {
                        $scope.$state.go($scope.nextStateAfterLogin.toState, $scope.nextStateAfterLogin.toParams);
                        $scope.nextStateAfterLogin = null;
                    }
                });

            }])

        .controller('yp.user.DialogLoginRegisterCtrl', ['$scope', '$modalInstance',
            function ($scope, $modalInstance) {

                var result = {
                    login: {
                        username: '',
                        password: ''
                    }
                };

                $scope.result = result;

                $scope.showRegistrationForm = function () {
                    delete result.login;
                    result.newuser = {};
                    $scope.showRegistrationForm = true;
                };

                $scope.$watchCollection('[result.newuser.firstname, result.newuser.lastname]', function () {
                    if (!$scope.registerform.username.$dirty && $scope.result.newuser.firstname) {
                        $scope.result.newuser.username = ($scope.result.newuser.firstname.substr(0, 1) || '').toLowerCase() + ($scope.result.newuser.lastname || '').toLowerCase();
                    }

                });

                $scope.done = function () {
                    $modalInstance.close(result);
                };

            }]);
}());
