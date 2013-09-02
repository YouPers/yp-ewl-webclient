'use strict';

/* Controllers */

angular.module('myApp.controllers', ['authentication', 'ngCookies', 'Base64', 'myApp.services'])
   .controller('LoginController', ['$scope', '$http', '$cookieStore',
        'base64codec', 'principal', 'authority','apiservice', '$location',
        function ($scope, $http, $cookieStore, base64codec, principal, authority, apiservice, $location) {

            // initialization: check if Auth cookie is set and if yes automatically authorize

            var encoded = $cookieStore.get('authdata');

            if (encoded != null) {
                loginBasicAuth(encoded);
            }

            $scope.model = {
                username: '',
                name: '',
                password: ''
            };

            function loginBasicAuth(encoded) {
                apiservice.login(encoded, function (data) {
                    $http.defaults.headers.common.Authorization = 'Basic ' + encoded;
                    $cookieStore.put('authdata', encoded);
                    authority.authorize(data);
                });
            }

            $scope.submit = function () {
                var encoded = base64codec.encode($scope.model.username + ':' + $scope.model.password);
                $scope.model.username = '';
                $scope.model.password = '';
                loginBasicAuth(encoded);
            };

            $scope.logout = function () {
                $cookieStore.remove('authdata');
                $http.defaults.headers.common.Authorization = '';
                authority.deauthorize();
            };

            $scope.register = function () {
                var user = {
                    username: $scope.model.username,
                    name: $scope.model.name,
                    password: $scope.model.password
                };
                $http.post(apiservice.getBaseURI() + '/user', user);
                $location.path('/view1');
            };

            $scope.isLoggedIn = function () {
                return principal.isAuthenticated();
            };

            $scope.getUsername = function () {
                if (principal.isAuthenticated()) {
                    return principal.identity().name();
                } else {
                    return '';
                }
            }
        }]);

