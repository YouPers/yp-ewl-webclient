(function () {
    'use strict';


    angular.module('yp.user')

        .factory("UserService", ['userRoles', '$cookieStore', 'authority', '$rootScope', 'Restangular', '$location', '$http', 'base64codec',
            function (userRoles, $cookieStore, authority, $rootScope, Rest, $location, $http, base64codec) {
                var users = Rest.all('users');
                var login = Rest.all('login');
                var validateUser = Rest.all('/users/validate');

                var UserService = {
                    encodeCredentials: function (username, password) {
                        return ({username: username, password: password});
                    },
                    login: function (cred, callback, keepMeLoggedIn) {
                        if (callback && !_.isFunction(callback) && !keepMeLoggedIn) {
                            keepMeLoggedIn = callback;
                            callback = undefined;
                        }

                        $http.defaults.headers.common.Authorization = 'Basic ' + base64codec.encode(cred.username + ':' + cred.password);

                        login.post({username: cred.username}).then(function success(result) {
                            if (keepMeLoggedIn) {
                                $cookieStore.put('authdata', cred);
                            }
                            authority.authorize(result);
                            if (callback) {
                                callback();
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
                            if (callback) {
                                callback();
                            }
                        });
                    },
                    reload: function() {
                        login.post({}).then(function succss(result) {
                            authority.authorize(result);
                        })
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
                    },
                    getUser: function(userId) {
                        return users.one(userId).get();
                    },
                    initialized: false
                };

                var credentialsFromCookie = $cookieStore.get('authdata');

                if (credentialsFromCookie) {
                    UserService.login(credentialsFromCookie, function () {
                        UserService.initialized = true;
                    });
                } else {
                    UserService.initialized = true;
                }

                return UserService;
            }]);

}());