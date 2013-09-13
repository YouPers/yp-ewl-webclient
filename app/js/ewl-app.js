'use strict';
/*global angular:true */

// Declare app level module which depends on filters, and services
angular.module('yp-ewl', ['yp.ewl.assessment', 'yp.ewl.activity', 'yp.discussion', 'yp.sociallog', 'yp.actionlog',
        'yp.ewl.cockpit-action-chart','yp.topic', 'ui.router', 'ui.bootstrap',
        'ngCookies', 'i18n', 'yp.commons', 'googlechart', 'authentication']).
    config(function ($stateProvider, $urlRouterProvider, userRoles, accessLevels) {
        //
        // For any unmatched url, send to /home
        $urlRouterProvider.otherwise("/home");
        //
        // Now set up the states
        $stateProvider
            .state('home', {
                url: "/home",
                templateUrl: "partials/home.html",
                access: accessLevels.all
            })
            .state('topics', {
                url: "/topics",
                templateUrl: "partials/topic.html",
                controller: "TopicController",
                access: accessLevels.all
            })
            .state('ewlActivityFields', {
                url: "/ewl-activityfields",
                templateUrl: "partials/ewlActivityFields.html",
                controller: "ActivityFieldCtrl",
                access: accessLevels.all
            })
            .state('cockpit', {
                url: "/cockpit",
                templateUrl: "partials/cockpit.html",
                access: accessLevels.user
            })
            .state('assessment', {
                url: "/assessment",
                templateUrl: "partials/assessment.html",
                controller: "AssessmentCtrl",
                access: accessLevels.user
            })
            .state('actionlist', {
                url: "/actions",
                templateUrl: "partials/actionlist.html",
                controller: "ActionListCtrl",
                access: accessLevels.all
            })
            .state('actionDetail', {
                url: "/actions/:actionId",
                templateUrl: "partials/activityplanning.html",
                controller: "ActivityCtrl",
                access: accessLevels.user,
                resolve: {
                    allActions: function (ActionService) {
                        return ActionService.allActivities;
                    },
                    plannedActions: function (ActionService) {
                        return ActionService.plannedActivities;
                    }
                }
            });
    })

    .run(['$rootScope', '$state', 'principal', 'userRoles', function ($rootScope, $state, principal, userRoles) {

        // handle routing authentication
        $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {

            var authenticated = principal.isAuthenticated(),
                requiredAccessLevel = toState.access,
                currentUserRole = userRoles.anonymous;

            if (authenticated) {
                currentUserRole = principal.identity().role();
            }

            // special case:
            // authenticated, returning user goes directly to cockpit
            if (!fromState.name && principal.isAuthenticated() && toState.name === 'home') {
                event.preventDefault();
                $state.go('cockpit');
            }

            if (!(principal.isAuthorized(requiredAccessLevel))) {
                event.preventDefault();
                $rootScope.$broadcast('loginMessageShow', {toState: toState, toParams: toParams});
            }

        });


    }]).

    config(['$translateProvider', function ($translateProvider) {
        $translateProvider.preferredLanguage('de');
        $translateProvider.useCookieStorage();
    }])


    .controller('MainCtrl', ['$scope', '$rootScope', '$state', 'authority', 'principal', '$cookieStore', 'userRoles', '$timeout',
        function ($scope, $rootScope, $state, authority, principal, $cookieStore, userRoles, $timeout) {

            // handle Menu Highlighting
            $scope.isActive = function (viewLocation) {
                return ($state.current.url.indexOf(viewLocation) !== -1);
            };

            $scope.$on('loginMessageShow', function (event, data) {
                $scope.showLoginDialog = true;
                $scope.nextStateAfterLogin = data;
            });

            var fakeLogin = function (credentials) {
                var knownUsers = {
                    ivan: {
                        id: 123123,
                        username: 'ivan',
                        fullname: 'Ivan Rigamonti',
                        picture: 'assets/img/IRIG.jpeg',
                        role: userRoles.admin
                    },
                    urs: {
                        id: 2342,
                        username: 'urs',
                        fullname: 'Urs Baumeler',
                        picture: 'assets/img/UBAU.jpeg',
                        role: userRoles.user
                    },
                    stefan: {
                        id: 34543,
                        username: 'stefan',
                        fullname: 'Stefan Müller',
                        picture: 'assets/img/SMUE.jpeg',
                        role: userRoles.user
                    },
                    reto: {
                        id: 777,
                        username: 'reto',
                        fullname: 'Reto Blunschi',
                        picture: 'assets/img/RBLU.jpeg',
                        role: userRoles.admin
                    }
                };

                if (credentials in knownUsers) {
                    // $http.defaults.headers.common.Authorization = 'Basic ' + username;
                    $cookieStore.put('authdata', credentials);
                    authority.authorize(
                        knownUsers[credentials]
                    );
                } else {
                    $rootScope.$broadcast('globalUserMsg', 'Login / password not valid, please try again or register', 'danger', 3000);
                }
            };

            var encodeCredentials = function (username, password) {
                return (username === password) ? username : '';
            };

            var credentialsFromCookie = $cookieStore.get('authdata');

            if (credentialsFromCookie) {
                fakeLogin(credentialsFromCookie);
            }

            $scope.principal = principal;

            $scope.loginSubmit = function () {
                // loginBasicAuth();
                fakeLogin(encodeCredentials($scope.username, $scope.password));
                $scope.username = '';
                $scope.password = '';
                if ($scope.nextStateAfterLogin) {
                    $state.go($scope.nextStateAfterLogin.toState, $scope.nextStateAfterLogin.toParams);
                    $scope.nextStateAfterLogin = null;
                } else {
                    $state.go('cockpit');
                }
                $scope.showLoginDialog = false;
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
            };

            $scope.$on('globalUserMsg', function (event, msg, type, duration) {
                $scope.globalUserMsg = {
                    text: msg,
                    type: type,
                    duration: duration
                };
                if (duration) {
                    $timeout(function () {
                         $scope.globalUserMsg = null;
                    }, duration);
                }
            });

            $scope.closeUserMsg = function () {
                $scope.globalUserMsg = null;
            };


        }]);




