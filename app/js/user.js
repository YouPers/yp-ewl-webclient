"use strict";

angular.module('yp.user', ['ui.router', 'authentication'])


    .factory("yp.user.UserService", ['userRoles','$cookieStore','authority','$rootScope', function(userRoles, $cookieStore, authority, $rootScope){
        var getNewUUID = function() {
            return 'asdfaf32241234';
        };

        var knownUsers = {
            ivan: {
                id: 123123,
                username: 'ivan',
                password: 'ivan',
                fullname: 'Ivan Rigamonti',
                picture: 'assets/img/IRIG.jpeg',
                role: userRoles.admin
            },
            urs: {
                id: '2342',
                username: 'urs',
                password: 'urs',
                fullname: 'Urs Baumeler',
                picture: 'assets/img/UBAU.jpeg',
                role: userRoles.user
            },
            stefan: {
                id: '34543',
                username: 'stefan',
                password: 'stefan',
                fullname: 'Stefan Müller',
                picture: 'assets/img/SMUE.jpeg',
                role: userRoles.user
            },
            reto: {
                id: '777',
                username: 'reto',
                password: 'reto',
                fullname: 'Reto Blunschi',
                picture: 'assets/img/RBLU.jpeg',
                role: userRoles.admin
            }
        };

        var UserService = {
            encodeCredentials:  function (username, password) {
                return ({username: username, password: password});
            },
            fakeLogin: function (cred) {
                 if ((cred.username in knownUsers) && (knownUsers[cred.username].password === cred.password)) {
                    // $http.defaults.headers.common.Authorization = 'Basic ' + username;
                    $cookieStore.put('authdata', cred);
                    authority.authorize(knownUsers[cred.username]);
                } else {
                    $rootScope.$broadcast('globalUserMsg', 'Login / password not valid, please try again or register', 'danger', 3000);
                }
            },
            logout: function(){
                $cookieStore.remove('authdata');
                // $http.defaults.headers.common.Authorization = '';
                authority.deauthorize();
            },
            submitNewUser: function(newuser) {
                newuser.id = getNewUUID();
                newuser.role = userRoles.user;
                newuser.fullname = newuser.firstname + ' ' + newuser.lastname;
                knownUsers[newuser.username]=newuser;

            }
        };

        var credentialsFromCookie = $cookieStore.get('authdata');

        if (credentialsFromCookie) {
            UserService.fakeLogin(credentialsFromCookie);
        }

        return UserService;
    }])

    .controller('yp.user.MenuLoginCtrl', [ '$scope', 'yp.user.UserService','$state', function($scope, UserService, $state){

        $scope.loginSubmit = function () {
            UserService.fakeLogin(UserService.encodeCredentials($scope.username, $scope.password));
            $scope.username = '';
            $scope.password = '';
            $state.go('cockpit');
        };

        $scope.logout = function () {
            UserService.logout();
        };


    }])

    .controller('yp.user.DialogLoginRegisterCtrl', ['$scope','$rootScope', '$state','yp.user.UserService',
        function( $scope,$rootScope, $state, UserService){

        $scope.$on('loginMessageShow', function (event, data) {
            $scope.showLoginDialog = true;
            $scope.nextStateAfterLogin = data;
        });

        $scope.loginSubmit = function () {
            // loginBasicAuth();
            UserService.fakeLogin(UserService.encodeCredentials($scope.username, $scope.password));
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

        $scope.registrationSubmit = function() {
            UserService.submitNewUser($scope.newuser);
            UserService.fakeLogin(UserService.encodeCredentials($scope.newuser.username, $scope.newuser.password));
            if ($scope.nextStateAfterLogin) {
                $state.go($scope.nextStateAfterLogin.toState, $scope.nextStateAfterLogin.toParams);
                $scope.nextStateAfterLogin = null;
            } else {
                $state.go('cockpit');
            }
            $scope.showLoginDialog = false;
            $scope.showRegistrationForm = false;
        };

        $scope.$watchCollection('[newuser.firstname, newuser.lastname]', function() {
            if (!$scope.registerform.username.$dirty && $scope.newuser.firstname) {
                $scope.newuser.username = ($scope.newuser.firstname.substr(0,1) || '').toLowerCase() + ($scope.newuser.lastname || '').toLowerCase();
            }

        });
    }]);
