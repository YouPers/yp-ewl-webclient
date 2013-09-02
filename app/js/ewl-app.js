'use strict';


// Declare app level module which depends on filters, and services
angular.module('yp-ewl', ['yp.ewl.assessment', 'yp.ewl.activity','globalErrors', 'ui.router','ui.bootstrap', 'pascalprecht.translate', 'ngCookies']).
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
                controller: "ActivityCtrl"
            })
            .state('planActivity', {
                url: "/ewl-activityfields",
                templateUrl: "partials/activityplanning.html",
                controller: "ActivityCtrl"
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
    }).

    config(['$translateProvider', function ($translateProvider) {
        $translateProvider.preferredLanguage('de');
        $translateProvider.useCookieStorage();
    }]);




