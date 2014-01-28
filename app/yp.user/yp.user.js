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


    angular.module('yp.user', ['ui.router', 'restangular', 'Base64', 'yp.config', 'ngCookies', 'angularFileUpload'])

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



        .controller('MenuLoginCtrl', [ '$scope', 'UserService', '$location', '$modal', '$window',
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
