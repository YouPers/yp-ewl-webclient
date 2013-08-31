angular.module('yp-ewl').
    config(['$translateProvider', function ($translateProvider) {

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
    }]);
