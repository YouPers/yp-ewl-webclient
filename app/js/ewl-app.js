'use strict';
/*global angular:true */
angular.module('ypconfig', [])
    .constant('ypconfig', {"backendUrl":"http://localhost:8000/api/v1"});

// Declare app level module which depends on filters, and services
angular.module('yp-ewl', ['yp.ewl.assessment', 'yp.ewl.activity', 'yp.discussion', 'yp.sociallog', 'yp.activitylog',
        'yp.ewl.activity.chart', 'yp.ewl.activity.chart2', 'yp.ewl.activity.vchart', 'yp.ewl.stresslevel.gauge', 'd3', 'd3.dir-hbar', 'd3.dir-vbar', 'd3.gauge', 'yp.topic', 'ui.router', 'ui.bootstrap',
        'ngCookies', 'i18n', 'yp.commons', 'googlechart', 'yp.auth', 'yp.healthpromoter', 'restangular', 'ypconfig']).

    config(['$stateProvider','$urlRouterProvider','accessLevels','RestangularProvider','ypconfig',
        function ($stateProvider, $urlRouterProvider, accessLevels, RestangularProvider, ypconfig) {
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
            .state('cockpit', {
                url: "/cockpit",
                templateUrl: "partials/cockpit.html",
                access: accessLevels.individual
            });

        RestangularProvider.setBaseUrl(ypconfig && ypconfig.backendUrl || "");
    }])

/**
 * setup checking of access levels for logged in user.
 */
    .run(['$rootScope', '$state', 'principal', function ($rootScope, $state, principal) {

        // handle routing authentication
       $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {

            var requiredAccessLevel = toState.access;

           // check whether user is authorized to access the desired access-Level
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

/**
 * main controller, responsible for
 * - showing global user messages
 * - highlighting global menu option according to currently active state
 * - setting principal to the scope, so all other scopes inherit it
 */
    .controller('MainCtrl', ['$scope',  '$state', '$timeout', 'principal',
        function ($scope, $state, $timeout, principal) {

            $scope.principal = principal;

            // handle Menu Highlighting
            $scope.isActive = function (viewLocation) {
                return ($state.current.name.indexOf(viewLocation) !== -1);
            };

            $scope.getTopMenu = function () {
                if ($state.current.url.indexOf('hp') !== -1) {
                    return 'healthpromoter';
                } else if ($state.current.url.indexOf('home') !== -1) {
                    return 'home';
                } else {
                    return 'individual';
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
