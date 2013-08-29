'use strict';


// Declare app level module which depends on filters, and services
angular.module('yp-ewl', ['myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.controllers', 'globalErrors', 'ui.router','ui.bootstrap', 'pascalprecht.translate']).
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
                controller: "AssessmentCtrl"
            })
            .state('planactivity', {
                url: "/planactivity",
                templateUrl: "partials/activityplanning.html",
                controller: "ActionFieldCtrl"
            })
    }).

    config(['$translateProvider', function ($translateProvider) {
        $translateProvider.translations('de', {
            COCKPIT: 'Cockpit',
            ACTIVITIES: 'Aktivitäten',
            ASSESSMENT: 'Fragebogen',
            LANGUAGE: 'Sprache',
            EMAIL: 'E-Mail',
            PASSWORD: 'Passwort',
            LOGIN: 'anmelden',
            INDIVIDUALS: 'Privat-Personen',
            HEALTH_PROMOTERS: 'Gesundheits-Promotoren',
            FOR: 'für',
            SELECT_YOUPERS_SERVICE: 'Wähle dein YouPers Service aus:',
            ASSESS_YOUR_STRESS_LEVEL: 'Beurteile deinen persönlichen Stresslevel:',
            GENERAL_STRESSLEVEL: 'Allgemeiner Stresslevel',
            HOW_PERCEIVE_CURRENT_LEVEL: 'Wie beurteilst du deinen Stresslevel jetzt in diesem Moment?',
            I_AM_UNDER_CHALLENGED: 'Ich bin unterfordert, mir ist langweilig',
            I_AM_OVERLOADED: 'Ich bin total gestresst',
            AT_WORK: 'Am Arbeitsplatz:',
            WORK: 'Arbeitsplatz',
            LEISURE: 'Freizeit',
            TIME: 'Zeit',
            NUTRITION: 'Ernährung',
            EXERCISE: 'Bewegung',
            SOCIAL: 'Soziales',
            BREAKS: 'Pausen',
            COMMUTE: 'Arbeitsweg',
            PLAN_IT: 'einplanen',
            PLANNED: 'geplant',
            SELECT_FIELD: 'Wähle ein Aktivitätsgebiet:'
        });

        $translateProvider.translations('en', {
            COCKPIT: 'Cockpit',
            ACTIVITIES: 'Activities',
            ASSESSMENT: 'Assessment',
            LANGUAGE: 'Language',
            EMAIL: 'email',
            PASSWORD: 'password',
            LOGIN: 'login',
            INDIVIDUALS: 'Individuals',
            HEALTH_PROMOTERS: 'Health Promoters',
            FOR: 'for',
            SELECT_YOUPERS_SERVICE: 'Select your YouPers Service:',
            ASSESS_YOUR_STRESS_LEVEL: 'Assess your personal stress level:',
            GENERAL_STRESSLEVEL: 'General stresslevel',
            HOW_PERCEIVE_CURRENT_LEVEL: 'How do you perceive your  stress level in this very moment?',
            I_AM_UNDER_CHALLENGED: 'I am bored and totally under challenged',
            I_AM_OVERLOADED: 'I am totally freaking out, cannot cope with everything',
            AT_WORK: 'At work:',
            WORK: 'Work',
            LEISURE: 'Leisure',
            TIME: 'Time',
            NUTRITION: 'Nutrition',
            EXERCISE: 'Exercise',
            SOCIAL: 'Social',
            BREAKS: 'Breaks',
            COMMUTE: 'Commute',
            PLAN_IT: 'plan it!',
            PLANNED: 'planned',
            SELECT_FIELD: 'Select an activity field:'
        });

        $translateProvider.preferredLanguage('de');
        $translateProvider.useCookieStorage();

    }]);




