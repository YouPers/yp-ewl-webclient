'use strict';


// Declare app level module which depends on filters, and services
angular.module('yp-ewl', ['yp.ewl.assessment', 'yp.ewl.activity', 'yp.discussion', 'yp.sociallog', 'yp.actionlog',
        'yp.ewl.cockpit-action-chart', 'ui.router', 'ui.bootstrap',
        'ngCookies', 'i18n', 'yp.filters', 'googlechart', 'authentication']).
    config(function ($stateProvider, $urlRouterProvider) {
        //
        // For any unmatched url, send to /home
        $urlRouterProvider.otherwise("/home");
        //
        // Now set up the states
        $stateProvider
            .state('home', {
                url: "/home",
                templateUrl: "partials/home.html"
            })
            .state('serviceChoice', {
                url: "/serviceChoice",
                templateUrl: "partials/topic.html"
            })
            .state('ewlActivityFields', {
                url: "/ewl-activityfields",
                templateUrl: "partials/ewlActivityFields.html",
                controller: "ActivityFieldCtrl"
            })
            .state('cockpit', {
                url: "/cockpit",
                templateUrl: "partials/cockpit.html"
            })
            .state('assessment', {
                url: "/assessment",
                templateUrl: "partials/assessment.html",
                controller: "AssessmentCtrl"
            })
            .state('planactivity', {
                url: "/planactivity",
                templateUrl: "partials/activityplanning.html",
                controller: "ActivityCtrl"
            })
            .state('actionlist', {
                url: "/actions",
                templateUrl: "partials/actionlist.html",
                controller: "ActionListCtrl"
            })
            .state('actionDetail', {
                url: "/actions/:actionId",
                templateUrl: "partials/activityplanning.html",
                controller: "ActivityCtrl",
                resolve: {
                    allActions: function (ActionService) {
                        return ActionService.allActivities;
                    },
                    plannedActions: function (ActionService) {
                        return ActionService.plannedActivities;
                    }
                }
            })


    }).

    config(['$translateProvider', function ($translateProvider) {
        $translateProvider.preferredLanguage('de');
        $translateProvider.useCookieStorage();
    }])


    .controller('MainCtrl', ['$scope', '$location', 'authority', 'principal', '$cookieStore', function ($scope, $location, authority, principal, $cookieStore) {

        // handle Menu Highlighting
        $scope.isActive = function (viewLocation) {
            return   $location.path().indexOf(viewLocation) != -1;
        };


        var fakeLogin = function (credentials) {
            var knownUsers = {
                ivan: {
                    id: 123123,
                    username: 'ivan',
                    fullname: 'Ivan Rigamonti',
                    picture: 'assets/img/IRIG.jpeg'
                }, urs: {
                    id: 2342,
                    username: 'urs',
                    fullname: 'Urs Baumeler',
                    picture: 'assets/img/UBAU.jpeg'
                },
                stefan: {
                    id: 34543,
                    username: 'stefan',
                    fullname: 'Stefan Müller',
                    picture: 'assets/img/SMUE.jpeg'
                },
                reto: {
                    id: 777,
                    username: 'reto',
                    fullname: 'Reto Blunschi',
                    picture: 'assets/img/RBLU.jpeg'
                }
            }

            if (credentials in knownUsers) {
                // $http.defaults.headers.common.Authorization = 'Basic ' + username;
                $cookieStore.put('authdata', credentials);
                authority.authorize(
                    knownUsers[credentials]
                );
            }
        }

        var encodeCredentials = function (username, password) {
            return (username == password) ? username : '';
        }

        var credentialsFromCookie = $cookieStore.get('authdata');

        if (credentialsFromCookie != null) {
            fakeLogin(credentialsFromCookie);
        }

        $scope.principal = principal;

        $scope.loginSubmit = function () {
            // loginBasicAuth();
            fakeLogin(encodeCredentials($scope.username, $scope.password));
            $scope.username = '';
            $scope.password = '';
        };

        $scope.logout = function () {
            $cookieStore.remove('authdata');
            // $http.defaults.headers.common.Authorization = '';
            authority.deauthorize();
        };

        $scope.getUsername = function () {
            if (principal.isAuthenticated()) {
                return principal.identity().name();
            } else {
                return '';
            }
        }


    }]);




