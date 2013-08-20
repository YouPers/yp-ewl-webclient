'use strict';

/* Controllers */

angular.module('myApp.controllers', ['authentication', 'ngCookies', 'Base64', 'myApp.services']).


    controller('MyCtrl1', ['$scope', '$http', 'apiservice', 'principal' , function ($scope, $http, apiservice, principal) {


        $scope.model = {
            surveys:  [],
            currentSurvey: {}
        };

        $scope.isLoggedIn = function () {
            return principal.isAuthenticated();
        }

        $scope.setCurrentSurvey = function (id) {
            for (var i = 0; i < $scope.model.surveys.length; i++) {
                if (id == $scope.model.surveys[i].id) {
                    $scope.model.currentSurvey = $scope.model.surveys[i];
                    break;
                }
            }
        }

        $scope.addNewQuestion = function () {
            $scope.model.currentSurvey.questions.push({
                "title": "new"
            })
        }

        $scope.saveCurrentSurvey = function () {
            $http.put(apiservice.getBaseURI() + '/survey/' + $scope.model.currentSurvey.id, $scope.model.currentSurvey).success(
                function (resp, status, headers) {
                    // $scope.survey = resp;
                }
            )
        }


        $scope.fetchSurveys = function () {

            //            $http.get('js/survey.json', config).success(function(resp, status, headers, config) {
            //            $http.get('http://ypserverapp.herokuapp.com/survey', config).success(function(resp, status, headers, config) {
            $http.get(apiservice.getBaseURI() + '/survey').success(function (resp, status, headers, config) {
                    $scope.model.surveys = resp;
                }
            )
            $scope.model.currentSurvey = {};
        }


        $scope.$on('event:authority-deauthorized', function () {
            $scope.model.currentSurvey = {};
            $scope.model.surveys = [];

        })
    }]).controller('LoginController', ['$scope', '$http', '$cookieStore',
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
            }

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
            }

            $scope.logout = function () {
                $cookieStore.remove('authdata');
                $http.defaults.headers.common.Authorization = '';
                authority.deauthorize();
            }

            $scope.register = function() {
                var user = {
                    username: $scope.model.username,
                    name: $scope.model.name,
                    password: $scope.model.password
                }
                $http.post(apiservice.getBaseURI()+'/user', user);
                $location.path('/view1');
            }

            $scope.isLoggedIn = function () {
                return principal.isAuthenticated();
            }

            $scope.getUsername = function () {
                if (principal.isAuthenticated()) {
                    return principal.identity().name();
                } else {
                    return '';
                }
            }
        }]);

