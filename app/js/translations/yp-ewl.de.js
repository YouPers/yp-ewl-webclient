/*  globalstrict:true angular:true */
'use strict';

angular.module('yp-ewl').
    config(['$translateProvider', function ($translateProvider) {

        $translateProvider.translations('de', {

            COCKPIT: 'Cockpit',
            ACTIVITIES: 'Aktivitäten',
            SHOW_ACTIVITY_LOG: 'Zeige dein Aktivitätslog',
            HIDE_ACTIVITY_LOG: 'Verstecke dein Aktivitätslog',
            SHOW_SOCIAL_LOG: 'Zeige deinen Social Ticker',
            HIDE_SOCIAL_LOG: 'Verstecke deinen Social Ticker',
            ASSESSMENT: 'Fragebogen',
            LANGUAGE: 'Sprache',
            EMAIL: 'E-Mail',
            PASSWORD: 'Passwort',
            LOGIN: 'anmelden',
            INDIVIDUALS: 'Privat-Personen',
            HEALTH_PROMOTERS: 'Gesundheits-Promotoren',
            FOR: 'für',
            CHOOSE_A_TOPIC: 'Wähle ein Gesundheits-Thema und setze dir ein Ziel:',
            ASSESS_YOUR_STRESS_LEVEL: 'Beurteile deinen persönlichen Stresslevel:',
            GENERAL_STRESSLEVEL: 'Allgemeiner Stresslevel',
            HOW_PERCEIVE_CURRENT_LEVEL: 'Wie beurteilst du deinen Stresslevel jetzt in diesem Moment?',
            I_AM_UNDER_CHALLENGED: 'Ich bin unterfordert, mir ist langweilig',
            I_AM_OVERLOADED: 'Ich bin total gestresst',
            AT_WORK: 'Stress am Arbeitsplatz',
            LEISURE_TIME: 'Stress in der Freizeit (Jobexterne Stressfaktoren)',
            STRESS_TYP: 'Stresstyp (Stressverstärker)',
            STRESS_MEASURES: 'Stressbewältigung (Entspannung/Ausgleich)',
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
            SUNDAY: 'Sonntag',
            TOPIC: 'Gesundheits-Thema',
            group: 'In der Gruppe',
            GROUP: 'In der Gruppe',
            self: 'Alleine',
            SELF: 'Alleine',
            DAILY: 'Täglich',
            WEEKLY_ON_THURSDAY: 'Jeden Donnerstag',
            WEEKLY: 'Jede Woche',
            WEEK: '1x/Woche',
            ONCE: 'Einmalig',
            CAMPAIGN: 'Kampagne',
            PRIVATE: 'Privat',
            COMMENTS: 'Kommentare',
            YOUPERS: 'Überprüft und empfohlen durch YouPers',
            NEW_ACTIVITY: 'Plane neue Aktivität',
            DETAIL_CHARTS: 'Ausführliche Darstellung',
            TO_THE_ASSESSMENT: 'Zum Fragebogen',
            ON: 'am',
            COMMENT: 'Kommentar',
            SAVE: 'Abspeichern',
            CANCEL: 'Abbrechen',
            YES: 'Ja',
            NO: 'Nein',
            FIRSTNAME: 'Vorname',
            LASTNAME: 'Nachname',
            USERNAME: "Username",
            PASSWORD_AGAIN: "Passwort wiederholen",
            REGISTER: "registrieren"
        });
    }]);
