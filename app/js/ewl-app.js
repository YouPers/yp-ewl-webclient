'use strict';
/*global angular:true */

// Declare app level module which depends on filters, and services
angular.module('yp-ewl', ['yp.ewl.assessment', 'yp.ewl.activity', 'yp.discussion', 'yp.sociallog', 'yp.activitylog',
        'yp.ewl.activity.chart','yp.topic', 'ui.router', 'ui.bootstrap',
        'ngCookies', 'i18n', 'yp.commons', 'googlechart', 'authentication', 'yp.user']).
    config(['$stateProvider','$urlRouterProvider','accessLevels',
        function ($stateProvider, $urlRouterProvider, accessLevels) {
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
            .state('cockpit', {
                url: "/cockpit",
                templateUrl: "partials/cockpit.html",
                access: accessLevels.user
            })
            .state('assessment', {
                url: "/assessment",
                templateUrl: "partials/assessment.html",
                controller: "AssessmentCtrl",
                access: accessLevels.all
            })
            .state('activitylist', {
                url: "/activities",
                templateUrl: "partials/activity.list.html",
                controller: "ActivityListCtrl",
                access: accessLevels.all
            })
            .state('activityDetail', {
                url: "/activities/:activityId",
                templateUrl: "partials/activity.detail.html",
                controller: "ActivityCtrl",
                access: accessLevels.user,
                abstract:true,
                resolve: {
                    allActivities: ['ActivityService',function (ActivityService) {
                        return ActivityService.allActivities;
                    }],
                    plannedActivities: ['ActivityService',function (ActivityService) {
                        return ActivityService.plannedActivities;
                    }]
                }
            })
            .state('activityDetail.self', {
                url: "",
                templateUrl: "partials/activity.detail.self.html",
                controller: "ActivityCtrl",
                access: accessLevels.user
            })
            .state('activityDetail.group', {
                url: "/group",
                templateUrl: "partials/activity.detail.group.html",
                controller: "ActivityCtrl",
                access: accessLevels.user
            })

        ;
    }])

/**
 * setup checking of access levels for logged in user.
 */
    .run(['$rootScope', '$state', 'principal', function ($rootScope, $state, principal) {

        // handle routing authentication
/**        $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {

            var requiredAccessLevel = toState.access;

            // special case:
            // authenticated, returning user goes directly to cockpit
            if (!fromState.name && principal.isAuthenticated() && toState.name === 'home') {
                event.preventDefault();
                $state.go('cockpit');
            }

            // check whether user is authorized to access the desired access-Level
            if (!(principal.isAuthorized(requiredAccessLevel))) {
                event.preventDefault();
                $rootScope.$broadcast('loginMessageShow', {toState: toState, toParams: toParams});
            }

        });
*/

    }]).

    config(['$translateProvider', function ($translateProvider) {
        $translateProvider.preferredLanguage('de');
        $translateProvider.useCookieStorage();
    }])

/**
 * main controller, responsible for
 * - showing global user messages
 * - highlighting global menu option according to currently active state
 * - providing access to logged in principal for all child states.
 *
 */
    .controller('MainCtrl', ['$scope',  '$state', '$timeout','principal',
        function ($scope, $state, $timeout, principal) {
            $scope.principal = principal;

            // handle Menu Highlighting
            $scope.isActive = function (viewLocation) {
                return ($state.current.name.indexOf(viewLocation) !== -1);
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




