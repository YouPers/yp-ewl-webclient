/*  globalstrict:true angular:true */
'use strict';

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
            CHOOSE_A_TOPIC: 'Choose a health topic and set a goal:',
            ASSESS_YOUR_STRESS_LEVEL: 'Assess your personal stress level:',
            GENERAL_STRESSLEVEL: 'General stresslevel',
            HOW_PERCEIVE_CURRENT_LEVEL: 'How do you perceive your  stress level in this very moment?',
            I_AM_UNDER_CHALLENGED: 'I am bored and totally under challenged',
            I_AM_OVERLOADED: 'I am totally freaking out, cannot cope with everything',
            AT_WORK: 'At work:',
            LEISURE_TIME: 'Stress at home (jobexteral factors)',
            STRESS_TYP: 'Stresstypus (Stress enhancer)',
            STRESS_MEASURES: 'Stresshandling (leisure/recreation)',
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
            SELECT_FIELD: 'Select an activity field:',
            MONDAY: 'Monday',
            TUESDAY: 'Tuesday',
            WEDNESDAY: 'Wednesday',
            THURSDAY: 'Thursday',
            FRIDAY: 'Friday',
            SATURDAY: 'Saturday',
            SUNDAY: 'Sunday',
            TOPIC: 'Health-Topic'
        });
    }]);
