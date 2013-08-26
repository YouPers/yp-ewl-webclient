'use strict';


// Declare app level module which depends on filters, and services
angular.module('yp-ewl', ['myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.controllers', 'globalErrors', 'ui.router', 'uiSlider']).
  config(function($stateProvider, $urlRouterProvider){
    //
    // For any unmatched url, send to /route1
    $urlRouterProvider.otherwise("/home")
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
            controller: "ActionFieldCtrl"
        })
        .state('planActivity', {
            url: "/ewl-activityfields",
            templateUrl: "partials/activityplanning.html",
            controller: "ActionFieldCtrl"
        })
        .state('cockpit', {
            url: "/cockpit",
            templateUrl: "partials/cockpit.html"
        })
        .state('assessment', {
            url: "/assessment",
            templateUrl: "partials/assessment.html",
            controller:  "AssessmentCtrl"
        })

})