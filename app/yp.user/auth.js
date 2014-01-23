(function () {
    'use strict';

    // Private variable for storing identity information.
    var _currentUser = {},

    // Stores whether the user has been authenticated
        _authenticated = false,

        _userRoles = {
            anonymous: 1,
            individual: 2,
            healthpromoter: 4,
            productadmin: 8,
            systemadmin: 16
        },

        _accessLevels = {
            all: _userRoles.anonymous | // 11111
                _userRoles.individual |
                _userRoles.healthpromoter |
                _userRoles.productadmin |
                _userRoles.systemadmin,
            anonymous: _userRoles.anonymous,  // 10000  nur zugänglich,  wenn nicht eingeloggt
            individual: _userRoles.individual |   // 01011
                _userRoles.productadmin |
                _userRoles.systemadmin,
            healthpromoter: _userRoles.healthpromoter | // 00111
                _userRoles.productadmin |
                _userRoles.systemadmin,
            admin: _userRoles.productadmin | _userRoles.systemadmin  // 00011
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
        .constant('userRoles', _userRoles)

        .constant('accessLevels', _accessLevels)


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
                isAuthorized: function (reqAccessLevel, rolesToCheck) {
                    var roles = 1;
                    if (_.isNumber(rolesToCheck)) {
                        roles = rolesToCheck;
                    } else if (Array.isArray(rolesToCheck)) {
                        roles = _.reduce(rolesToCheck, function (sum, role) {
                            return sum | _userRoles[role];
                        }, 0);
                    } else if (_currentUser && ('roles' in _currentUser) && Array.isArray(_currentUser.roles)) {
                        roles = _.reduce(_currentUser.roles, function (sum, role) {
                            return sum | _userRoles[role];
                        }, 0);
                    } else if (_currentUser && ('roles' in _currentUser) && _.isNumber(_currentUser.roles)) {
                        roles = _currentUser.role;
                    }

                    if (_.isString(reqAccessLevel)) {
                        reqAccessLevel = _accessLevels[reqAccessLevel];
                    }
                    return reqAccessLevel & roles;
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
                            if (!(currentUser && ('username' in currentUser) && (('roles' in currentUser) || ('role' in currentUser)) && ('id' in currentUser))) {
                                throw new Error('Authorize user: incorrect type: ' + angular.toJson(currentUser));
                            }

                            if (!currentUser.roles || currentUser.roles.length === 0) {
                                currentUser.roles = [currentUser.role];
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
                var validateUser = Rest.all('/users/validate');

                var UserService = {
                    encodeCredentials: function (username, password) {
                        return ({username: username, password: password});
                    },
                    login: function (cred, successCallback, keepMeLoggedIn) {
                        if (successCallback && !_.isFunction(successCallback) && !keepMeLoggedIn) {
                            keepMeLoggedIn = successCallback;
                            successCallback = undefined;
                        }

                        $http.defaults.headers.common.Authorization = 'Basic ' + base64codec.encode(cred.username + ':' + cred.password);

                        login.post({username: cred.username}).then(function success(result) {
                            if (keepMeLoggedIn) {
                                $cookieStore.put('authdata', cred);
                            }
                            authority.authorize(result);
                            if (successCallback) {
                                successCallback();
                            }

                        }, function error(err) {
                            $http.defaults.headers.common.Authorization = '';
                            var msg;
                            if (err && (err.status === 0 || err.status === 404)) {
                                msg = 'YouPers Backend Server not reachable, please try again later, Code: ' + err.status;
                            } else {
                                msg = 'Login / password not valid, please try again or register, Code: ' + err.status;
                            }
                            $rootScope.$broadcast('globalUserMsg', msg, 'danger', 3000);
                        });
                    },
                    logout: function () {
                        $cookieStore.remove('authdata');
                        $http.defaults.headers.common.Authorization = '';
                        authority.deauthorize();
                    },
                    validateUser: function(user, success,error) {
                        validateUser.post(user).then(success,error);
                    },
                    submitNewUser: function (newuser, successCallback) {
                        newuser.role = 'individual';
                        newuser.fullname = newuser.firstname + ' ' + newuser.lastname;
                        users.post(newuser).then(function () {
                            $rootScope.$broadcast('globalUserMsg', 'New Account successfully created', 'success', 3000);
                        }).then(successCallback, function (err) {
                                $rootScope.$broadcast('globalUserMsg', 'Account not created: Error: ' + err.data.message, 'danger', 3000);
                            });
                    },
                    putUser: function (user) {
                        return Rest.restangularizeElement(null, user, "users").put();
                    },
                    verifyEmail: function (userid, token) {
                        return users.one(userid).all("email_verification").post({token: token});
                    },
                    requestPasswordReset: function (usernameOrEmail) {
                        return users.all("request_password_reset").post({usernameOrEmail: usernameOrEmail});
                    },
                    passwordReset: function (token, newPassword) {
                        return users.all("password_reset").post({token: token, password: newPassword});
                    }
                };

                var credentialsFromCookie = $cookieStore.get('authdata');

                if (credentialsFromCookie) {
                    var targetLocation = $location.path();
                    $location.path('/');
                    UserService.login(credentialsFromCookie, function () {
                        if (targetLocation === '/home' || targetLocation === '/') {
                            $location.path('/cockpit');
                        } else {
                            $location.path(targetLocation);
                        }
                    });
                }

                return UserService;
            }])

        .controller('yp.user.MenuLoginCtrl', [ '$scope', 'yp.user.UserService', '$location', '$modal', '$window',
            function ($scope, UserService, $location, $modal, $window) {


                $scope.loginSubmit = function () {
                    UserService.login(UserService.encodeCredentials($scope.username, $scope.password), function () {
                            $scope.username = '';
                            $scope.password = '';
                        },
                        $scope.keepMeLoggedIn
                    );

                };

                $scope.logout = function () {
                    UserService.logout();
                    $location.path("/");
                    $window.location.reload();
                };


                $scope.$on('event:authority-authorized', function (event, data) {
                    if ($scope.nextStateAfterLogin) {
                        $scope.$state.go($scope.nextStateAfterLogin.toState, $scope.nextStateAfterLogin.toParams);
                        $scope.nextStateAfterLogin = null;
                    }
                });

            }]);

}());
