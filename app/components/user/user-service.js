(function () {
    'use strict';

    // Private variable for storing identity information.
    var _userRoles = {
            anonymous: 1,
            individual: 2,
            orgadmin: 4,
            campaignlead: 8,
            productadmin: 16,
            systemadmin: 32
        },

        _accessLevels = {
            all: _userRoles.anonymous | // 11111
                _userRoles.individual |
                _userRoles.orgadmin |
                _userRoles.campaignlead |
                _userRoles.productadmin |
                _userRoles.systemadmin,
            anonymous: _userRoles.anonymous,  // 10000  nur zugänglich,  wenn nicht eingeloggt
            user: _userRoles.individual |
                _userRoles.orgadmin |
                _userRoles.campaignlead |
                _userRoles.productadmin |
                _userRoles.systemadmin,  // 10000  nur zugänglich,  wenn nicht eingeloggt
            individual: _userRoles.individual |
                _userRoles.productadmin |
                _userRoles.systemadmin,
            orgadmin: _userRoles.orgadmin |
                _userRoles.productadmin |
                _userRoles.systemadmin,
            campaignlead: _userRoles.campaignlead |
                _userRoles.orgadmin |
                _userRoles.productadmin |
                _userRoles.systemadmin,
            admin: _userRoles.productadmin | _userRoles.systemadmin,   // 00011
            systemadmin: _userRoles.systemadmin
        };

    var _emptyDefaultUser = {profile: {prefs: {email: {}}}};
    var _currentUser = _.clone(_emptyDefaultUser);
    var _authenticated = false;


    angular.module('yp.components.user')

        // authorization levels and user Roles
        .constant('userRoles', _userRoles)

        .constant('accessLevels', _accessLevels)

        .factory("UserService", ['userRoles', '$cookieStore', '$rootScope', 'Restangular', '$location', '$http', 'base64codec', '$q',
            function (userRoles, $cookieStore, $rootScope, Rest, $location, $http, base64codec, $q) {
                var users = Rest.all('users');
                var profiles = Rest.all('profiles');
                var login = Rest.all('login');
                var validateUser = Rest.all('/users/validate');

                var _authorize = function authorize(authenticatedUser) {
                    // check argument and mandatory keys
                    if (!(authenticatedUser && ('username' in authenticatedUser) && (('roles' in authenticatedUser) || ('role' in authenticatedUser)) && ('id' in authenticatedUser))) {
                        return $q.reject('Authorize user: incorrect type: ' + angular.toJson(authenticatedUser));
                    }

                    if (!authenticatedUser.roles || authenticatedUser.roles.length === 0) {
                        authenticatedUser.roles = [authenticatedUser.role];
                    }


                    // copy the following user properties from the current user,
                    // if the user is not already authenticated
                    if (!_authenticated) {
                        authenticatedUser.campaign = _currentUser.campaign || authenticatedUser.campaign;
                    }

                    // clean current user in order to keep the same reference,


                    // keep the profile, if the newly authenticated user does not provide an updated populated profile
                    var hasProfilePopulated = authenticatedUser.profile && authenticatedUser.profile.id;
                    if (!hasProfilePopulated) {
                        authenticatedUser.profile = _currentUser.profile;
                    }

                    // keep the campaign, if the newly authenticated user does not provide an updated populated campaign
                    var hasCampaignPopulated = authenticatedUser.campaign && authenticatedUser.campaign.id;
                    if (!hasCampaignPopulated) {
                        authenticatedUser.campaign = _currentUser.campaign;
                    }

                    _.forEach(_.keys(_currentUser), function (key) {
                        delete _currentUser[key];
                    });

                    // merge the user obj recursively to the current user
                    _.merge(_currentUser, authenticatedUser);

                    _authenticated = true;

                    // Broadcast the authorized event
                    $rootScope.$broadcast('event:authority-authorized');
                    return authenticatedUser;
                };

                // `deauthorize` resets the `principal` and `identity`
                var _deauthorize = function () {
                    _authenticated = false;
                    _currentUser = _.clone(_emptyDefaultUser);

                    // Broadcast the deauthorized event
                    $rootScope.$broadcast('event:authority-deauthorized');
                };

                var UserService = {
                    encodeCredentials: function (username, password) {
                        return ({username: username, password: password});
                    },
                    login: function (token, keepMeLoggedIn) {

                        $http.defaults.headers.common.Authorization = 'Bearer ' + token;

                        return login.post()
                            .then(function success(user) {
                                if (keepMeLoggedIn) {
                                    $cookieStore.put('authdata', token);
                                }
                                return _authorize(user);

                            }, function error(err) {
                                $http.defaults.headers.common.Authorization = '';
                                $rootScope.$emit('clientmsg:error', err);

                                if (err.data && err.data.code === 'UnauthorizedError') {
                                    $rootScope.$emit('clientmsg:error', 'loginFailed', { error: err });
                                } else {
                                    $rootScope.$emit('clientmsg:error', err);
                                }

                                return $q.reject(err);
                            });
                    },
                    reload: function () {
                        return login.post({}).then(function success(result) {
                            return _authorize(result);
                        });
                    },
                    logout: function () {
                        $cookieStore.remove('authdata');
                        $http.defaults.headers.common.Authorization = '';
                        _deauthorize();
                    },
                    validateUser: function (user) {
                        return validateUser.post(user);
                    },
                    submitNewUser: function (newuser) {
                        newuser.roles = ['individual'];
                        newuser.fullname = newuser.firstname + ' ' + newuser.lastname;

                        // in case this was an unauthenticated user who was browsing and collecting data,
                        // we need to merge the user we submit with the data we have already collected
                        if (!_authenticated) {
                            newuser = _.merge(newuser, _currentUser);
                        }

                        return users.post(newuser);
                    },
                    putUser: function (user) {
                        return Rest.restangularizeElement(null, user, "users").put().then(function success(updatedUser) {
                            // check whether we have updated the current user, if yes update our session object
                            if (_currentUser.id === updatedUser.id) {
                                _authorize(updatedUser);
                            }
                            return updatedUser;
                        });
                    },
                    verifyEmail: function (userid, token) {
                        return users.one(userid).all("email_verification").post({token: token});
                    },
                    requestPasswordReset: function (usernameOrEmail) {
                        return users.all("request_password_reset").post({usernameOrEmail: usernameOrEmail});
                    },
                    passwordReset: function (token, newPassword) {
                        return users.all("password_reset").post({token: token, password: newPassword});
                    },
                    getUser: function (userId, options) {
                        return users.one(userId).get(options);
                    },
                    getUsers: function (options) {
                        return users.getList(options);
                    },
                    getProfiles: function (options) {
                        return profiles.getList(options);
                    },
                    principal: {
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
                    },
                    initialized: false
                };

                var tokenRetrieved = $location.search().token || $cookieStore.get('authdata');

                if (tokenRetrieved) {
                    UserService.login(tokenRetrieved, true)
                        .then(function success() {
                            UserService.initialized = true;
                        }, function error(err) {
                            UserService.initialized = true;
                        });
                } else {
                    UserService.initialized = true;
                }

                return UserService;
            }]);

}());