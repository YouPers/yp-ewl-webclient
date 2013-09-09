'use strict';


// Declare app level module which depends on filters, and services
angular.module('yp-ewl', ['yp.ewl.assessment', 'yp.ewl.activity','yp.discussion','yp.sociallog', 'yp.actionlog', 'google-chart-sample', 'globalErrors', 'ui.router','ui.bootstrap',
        'ngCookies', 'i18n', 'yp.filters', 'googlechart']).
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
                templateUrl: "partials/serviceChoice.html"
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


    .controller('MainMenuCtrl', ['$scope','$location', function($scope, $location) {
        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };
    }]);




