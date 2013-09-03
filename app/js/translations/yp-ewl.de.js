angular.module('yp-ewl').
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
            AT_WORK: 'Stress am Arbeitsplatz',
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
            SELECT_FIELD: 'Wähle ein Aktivitätsgebiet:',
            MONDAY: 'Montag',
            TUESDAY: 'Dienstag',
            WEDNESDAY: 'Mittwoch',
            THURSDAY: 'Donnerstag',
            FRIDAY: 'Freitag',
            SATURDAY: 'Samstag',
            SUNDAY: 'Sonntag'
        })
    }]);
