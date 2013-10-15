var mock = {};

mock.plannedActivities = [
    {
        id: "2311234",
        "activity": {
            id: "Act-17"
        },
        "planType": "once",
        "privacy": "public",
        "executionType": "group",
        "onceDate": "",
        "onceTime": "",
        "status": 'active'
    },
    {
        "id": "9340909",
        "activity": {
            id: "Act-55"
        },
        "planType": "weekly",
        "privacy": "public",
        "executionType": "self",
        "weeklyDayOfWeek": "MONDAY",
        "status": 'active'
    },
    {
        "id": "0909vxcyvyxc",
        "activity": {
            id: "Act-34"
        },
        "planType": "daily",
        "privacy": "public",
        "executionType": "group",
        "dailyTime": "",
        "status": 'old'
    },
    {
        "id": "0909vxcyvyxc",
        "activity": {
            id: "Act-59"
        },
        "planType": "daily",
        "privacy": "public",
        "executionType": "group",
        "dailyTime": "",
        "status": 'old'
    }

];

mock.users = [
    {
        "id": "9u230u23f",
        "href": "users/ubau",
        "avatar": "assets/img/UBAU.jpeg",
        "username": "urs",
        "firstname": "Urs",
        "lastname": "Baumeler",
        "fullname": "Urs Baumeler",
        "roles": [2],
        "subscriptions": [],
        "individual": {
            "id": "98723498713245",
            "href": "/individual/98723498713245",
            "birthDate": "1963-05-27T00:00:00.000Z",
            "sex": "m",
            "maritalStatus": "married"
        },
        preferences: {
            dismissedDialogs: []
        },
        assessmentAnswers: []

    },
    {
        "id": "234509uldfssdv",
        "href": "users/rblu",
        "avatar": "assets/img/RBLU.jpeg",
        "username": "reto",
        "firstname": "Reto",
        "lastname": "Blunschi",
        "fullname": "Reto Blunschi",
        "role": 2,
        "subscriptions": [],
        "individual": {
            "id": "asvaevwwevew",
            "href": "/individual/asvaevwwevew",
            "birthDate": "1974-07-07T00:00:00.000Z",
            "sex": "m",
            "maritalStatus": "married"
        },
        preferences: {
            dismissedDialogs: ['HealthPromoterWelcome']
        },
        assessmentAnswers: []

    },
    {
        "id": "fwefwevv232323",
        "href": "users/irig",
        "avatar": "assets/img/IRIG.jpeg",
        "username": "ivan",
        "firstname": "Ivan",
        "lastname": "Rigamonti",
        "fullname": "Ivan Rigamonti",
        "role": 2,
        "subscriptions": [],
        "individual": {
            "id": "lkdsjvkldjsf",
            "href": "/individual/lkdsjvkldjsf",
            "birthDate": "1963-01-01T00:00:00.000Z",
            "sex": "m",
            "maritalStatus": "married"
        },
        preferences: {
            dismissedDialogs: []
        },
        assessmentAnswers: []

    },
    {
        "id": "xcyvsvsdvsdv",
        "href": "users/smue",
        "avatar": "assets/img/SMUE.jpeg",
        "username": "stefan",
        "firstname": "Stefan",
        "lastname": "Müller",
        "fullname": "Stefan Müller",
        "role": 2,
        "subscriptions": [],
        "individual": {
            "id": "ewvwevewvyxcvxv",
            "href": "/individual/lkdsjvkldjsf",
            "birthDate": "1974-07-07T00:00:00.000Z",
            "sex": "m",
            "maritalStatus": "married"
        },
        preferences: {
            dismissedDialogs: []
        },
        assessmentAnswers: []
    }

];

mock.activityComments = [
    {
        "id": "1",
        "ref_obj_id": "1",
        "ref_obj": "activity",
        "author": {
            "id": "1",
            "fullname": "Urs Baumeler",
            "pic": "assets/img/UBAU.jpeg",
            "link": "#/u/UBAU"
        },
        "date": "2013-08-03T18:33:50.558Z",
        "type": "generic",
        "text": "Wer kommt mit, jeweils Mittwochs 11:45 ab Bahnhof Stettbach, easy jogging?",
        "comments": [
            {
                "id": "1",
                "ref_id": "1",
                "ref_obj": "activity",
                "thread_id": "1",
                "author": {
                    "id": "2",
                    "fullname": "Ivan Rigamonti",
                    "pic": "assets/img/IRIG.jpeg",
                    "link": "#/u/IRIG"
                },
                "date": "2013-08-04T18:33:50.558Z",
                "text": "Keine Zeit am Mittwoch"
            },
            {
                "id": "2",
                "ref_id": "1",
                "ref_obj": "activity",
                "thread_id": "1",
                "author": {
                    "id": "3",
                    "fullname": "Stefan Müller",
                    "pic": "assets/img/SMUE.jpeg",
                    "link": "#/u/SMUE"
                },
                "date": "2013-08-05T18:33:50.558Z",
                "text": "Ist mir zu langsam mit dir ;-)"
            },
            {
                "id": "3",
                "ref_id": "1",
                "ref_obj": "activity",
                "thread_id": "1",
                "author": {
                    "id": "3",
                    "fullname": "Stefan Müller",
                    "pic": "assets/img/SMUE.jpeg",
                    "link": "#/u/SMUE"
                },
                "date": "2013-08-06T18:33:50.558Z",
                "text": "Ist mir zu langsam mit dir ;-)"
            }
        ]
    },
    {
        "id": "2",
        "ref_obj_id": "1",
        "ref_obj": "activity",
        "author": {
            "id": "1",
            "fullname": "Stefan Müller",
            "pic": "assets/img/SMUE.jpeg",
            "link": "#/u/SMUE"
        },
        "date": "2013-07-03T18:33:50.558Z",
        "type": "generic",
        "text": "Heute 17 Km gemacht, war supercool",
        "comments": [
            {
                "id": "4",
                "ref_id": "1",
                "ref_obj": "activity",
                "thread_id": "1",
                "author": {
                    "id": "2",
                    "fullname": "Ivan Rigamonti",
                    "pic": "assets/img/IRIG.jpeg",
                    "link": "#/u/IRIG"
                },
                "date": "2013-07-04T18:33:50.558Z",
                "text": "Gratulation, nicht schlecht, morgen gehen wir zusammen oder?"
            },
            {
                "id": "5",
                "ref_id": "1",
                "ref_obj": "activity",
                "thread_id": "1",
                "author": {
                    "id": "3",
                    "fullname": "Stefan Müller",
                    "pic": "assets/img/SMUE.jpeg",
                    "link": "#/u/SMUE"
                },
                "date": "2013-07-05T18:33:50.558Z",
                "text": "Ist mir zu langsam mit dir ;-)"
            }
        ]
    },
    {
        "id": "3",
        "ref_obj_id": "1",
        "ref_obj": "activity",
        "author": {
            "id": "1",
            "fullname": "Stefan Müller",
            "pic": "assets/img/SMUE.jpeg",
            "link": "#/u/SMUE"
        },
        "date": "2012-09-03T18:33:50.558Z",
        "type": "rating",
        "text": "Heute 17 Km gemacht, war supercool",
        "ratingValue": 4,
        "comments": [
            {
                "id": "4",
                "ref_id": "1",
                "ref_obj": "activity",
                "thread_id": "1",
                "author": {
                    "id": "2",
                    "fullname": "Ivan Rigamonti",
                    "pic": "assets/img/IRIG.jpeg",
                    "link": "#/u/IRIG"
                },
                "date": "2012-09-03T18:33:50.558Z",
                "text": "Gratulation, nicht schlecht, morgen gehen wir zusammen oder?"
            },
            {
                "id": "5",
                "ref_id": "1",
                "ref_obj": "activity",
                "thread_id": "1",
                "author": {
                    "id": "3",
                    "fullname": "Stefan Müller",
                    "pic": "assets/img/SMUE.jpeg",
                    "link": "#/u/SMUE"
                },
                "date": "16.05.2013",
                "text": "Ist mir zu langsam mit dir ;-)"
            }
        ]
    }
];


mock.assessment = {
    "id": "1",
    "name": "ASSESS_YOUR_STRESS_LEVEL",
    "questionCats": [
        {
            "id": "1",
            "category": "GENERAL_STRESSLEVEL",
            "questions": [
                {
                    "id": 1,
                    "category": "general",
                    "title": "Stresslevel",
                    "type": "twoSided",
                    "mintext": "Unterfordernd/Langweilig",
                    "midtext": "Ausgewogen / positiver, motivierender Stress",
                    "maxtext": "Überfordernd/Frustrierend",
                    "exptext": "tbd"
                }
            ]
        },
        {
            "id": "2",
            "category": "AT_WORK",
            "questions": [
                {
                    "id": 2,
                    "category": "work",
                    "title": "Arbeitsmenge",
                    "type": "twoSided",
                    "mintext": "Ungenügend",
                    "midtext": "Gerade richtig",
                    "maxtext": "Erdrückend",
                    "exptext": "Zur Bewältigung meiner Arbeitsmenge muss ich lange arbeiten / Überzeit leisten / mit hohem Tempo arbeiten; Ich arbeite ständig unter einem grossen Leistungs- bzw. Zeitdruck, Für eine seriöse Planung und Organisation der Arbeit fehlt mir die Zeit, Mein privates Leben kommt verursacht durch die berufliche Beanspruchung zu kurz"
                },
                {
                    "id": 3,
                    "category": "work",
                    "title": "Erfolgsdruck",
                    "type": "twoSided",
                    "mintext": "Zu wenig",
                    "midtext": "Optimal",
                    "maxtext": "Zu viel",
                    "exptext": "Die Erwartungen an meine Arbeitsergebnisse/-qualität sind sehr hoch; Ich stehe unter hohem Erfolgsdruck"
                },
                {
                    "id": 4,
                    "category": "work",
                    "title": "Unterstützung",
                    "type": "twoSided",
                    "mintext": "Zu wenig",
                    "midtext": "Gerade richtig",
                    "maxtext": "Zu viel",
                    "exptext": "Es gibt keine Unterstützung, wenn ich sie brauche, Ich werde von meinem Vorgesetzten \"überbetreut\""
                },
                {
                    "id": 5,
                    "category": "work",
                    "title": "Selbstbestimmung",
                    "type": "twoSided",
                    "mintext": "Zu wenig",
                    "midtext": "Gerade richtig",
                    "maxtext": "Zu viel",
                    "exptext": "Ich habe keinen Einfluss auf die Planung und Gestaltung meiner Arbeit, Ich habe zu wenig Entscheidungsfreiheit, Meine Arbeitsgestaltung ist weitgehend Fremdbestimmt"
                },
                {
                    "id": 6,
                    "category": "work",
                    "title": "Arbeitsbedingungen",
                    "type": "oneSided",
                    "mintext": "Schlecht",
                    "midtext": "Optimal",
                    "maxtext": "n/a",
                    "exptext": "Viele Störungen, viele Sitzungen, grosser administrativer Aufwand, Lärm, Enge, Grossraumbüro, Raumklima/Temperatur, körperliche Belastung"
                },
                {
                    "id": 7,
                    "category": "work",
                    "title": "Arbeitsanforderungen",
                    "type": "twoSided",
                    "mintext": "Unterfordernd",
                    "midtext": "Ausgewogen",
                    "maxtext": "Überfordernd",
                    "exptext": "Die mir gestellten Ziele und Aufgaben überfordern mich, Ich erlebe zu viel Routine, Es fehlt die Herausforderung, Ich empfinde meine Arbeit als langweilig"
                },
                {
                    "id": 8,
                    "category": "work",
                    "title": "Arbeitsidentifikation",
                    "type": "twoSided",
                    "mintext": "Zu gering",
                    "midtext": "Ausgewogen",
                    "maxtext": "Zu hoch",
                    "exptext": "Meine Arbeit entspricht überhaupt nicht meinen eigentlichen Interessen und Neigungen"
                },
                {
                    "id": 9,
                    "category": "work",
                    "title": "Anerkennung",
                    "type": "twoSided",
                    "mintext": "Zu wenig",
                    "midtext": "Gut",
                    "maxtext": "Übertrieben",
                    "exptext": "Ich bekomme kein echtes Feedback (fehlende Anerkennung und mangelnde konstruktive Kritik), Meine Vorschläge, Anregungen, Kritik werden nicht ernst genommen"
                },
                {
                    "id": 10,
                    "category": "work",
                    "title": "Entwicklungsmöglichkeiten",
                    "type": "twoSided",
                    "mintext": "Zu wenig",
                    "midtext": "Optimal",
                    "maxtext": "Zu viel"
                },
                {
                    "id": 11,
                    "category": "work",
                    "title": "Betriebsklima",
                    "type": "twoSided",
                    "mintext": "Demotivierend",
                    "midtext": "Optimal",
                    "maxtext": "Übermotivierend",
                    "exptext": "Ungelöste Konflikte belasten mich, Es herrscht ein schlechtes Betriebsklima in meinem Umfeld, Ich werde gemobbt, Ich werde diskriminiert"
                },
                {
                    "id": 12,
                    "category": "work",
                    "title": "Arbeitsplatzsicherheit",
                    "type": "oneSided",
                    "mintext": "Zu gering",
                    "midtext": "hoch",
                    "maxtext": "n/a",
                    "exptext": "Ich habe Angst vor einem Arbeitsplatzverlust"
                }
            ]
        },
        {

            "id": "3",
            "category": "LEISURE_TIME",
            "questions": [
                {
                    "id": 13,
                    "category": "leisure",
                    "title": "Freizeitverpflichtungen",
                    "type": "twoSided",
                    "mintext": "Zu wenige",
                    "midtext": "Gerade richtig",
                    "maxtext": "Zu viele ",
                    "exptext": "Kinderbetreuung, Krankenpflege, Haushaltsarbeiten, Gartenarbeiten, Vereinstätigkeiten, weitere  Verpflichtungen"
                },
                {
                    "id": 14,
                    "category": "leisure",
                    "title": "Familiäre Situation",
                    "type": "oneSided",
                    "mintext": "Belastend",
                    "midtext": "Entlastend",
                    "maxtext": "n/a",
                    "exptext": "Beziehungsprobleme, Trennung, Schul-/Erziehungsprobleme, Krankheit von mir/Angehörigen, Verlust eines Angehörigen"
                },
                {
                    "id": 15,
                    "category": "leisure",
                    "title": "Finanzielle Situation",
                    "type": "oneSided",
                    "mintext": "Belastend",
                    "midtext": "gut",
                    "maxtext": "n/a",
                    "exptext": "Permanente Geldknappheit, Schulden"
                },
                {
                    "id": 16,
                    "category": "leisure",
                    "title": "Soziales Umfeld",
                    "type": "twoSided",
                    "mintext": "Wenig unterstützend",
                    "midtext": "Optimal",
                    "maxtext": "Einengend",
                    "exptext": "Ich werde von meinen sozialen Umfeld zu wenig unterstützt und getragen\nNachbarschaftsprobleme"
                }
            ]
        },
        {

            "id": "4",
            "category": "STRESS_TYP",
            "questions": [
                {
                    "id": 17,
                    "category": "stresstypus",
                    "title": "Selbstanforderung",
                    "type": "twoSided",
                    "mintext": "Minimalistisch",
                    "midtext": "Ausgewogen",
                    "maxtext": "Perfektionistisch"
                },
                {
                    "id": 18,
                    "category": "stresstypus",
                    "title": "Kontrollbedürfnis",
                    "type": "twoSided",
                    "mintext": "Zu wenig",
                    "midtext": "Ausgewogen",
                    "maxtext": "Zu viel",
                    "exptext": "Zu viel: Zwanghaft"
                },
                {
                    "id": 19,
                    "category": "stresstypus",
                    "title": "Verantwortungsbewusstsein",
                    "type": "twoSided",
                    "mintext": "Zu wenig",
                    "midtext": "Ausgewogen",
                    "maxtext": "Zu viel",
                    "exptext": "Zu wenig: Verantwortungslos, leichtsinnig, gleichgültig\nZu viel: Zu starkes Verantwortungsgefühl, zu starkes Pflichtgefühl"
                },
                {
                    "id": 20,
                    "category": "stresstypus",
                    "title": "Harmoniebedürfnis",
                    "type": "twoSided",
                    "mintext": "Zu wenig",
                    "midtext": "Ausgewogen",
                    "maxtext": "Zu viel",
                    "exptext": "Zu viel: Überangepasst"
                },
                {
                    "id": 21,
                    "category": "stresstypus",
                    "title": "Geltungsbedürfnis",
                    "type": "twoSided",
                    "mintext": "Sich unterordnend",
                    "midtext": "Ausgewogen",
                    "maxtext": "Dominierend"
                }

            ]
        },
        {
            "id": "4",
            "category": "STRESS_MEASURES",
            "questions": [
                {
                    "id": 22,
                    "category": "handling",
                    "title": "Pausen",
                    "type": "oneSided",
                    "mintext": "Zu wenig",
                    "midtext": "Optimal",
                    "maxtext": "n/a",
                    "exptext": "Keine/zu wenige/zu kurze Pausen während der Arbeit, \nZu wenig Erholungszeit am Mittag/Feierabend/Wochenende, Keine/zu wenig/zu kurze Ferien"
                },
                {
                    "id": 23,
                    "category": "handling",
                    "title": "Schlaf",
                    "type": "oneSided",
                    "mintext": "Zu wenig",
                    "midtext": "Optimal",
                    "maxtext": "n/a",
                    "exptext": "Ich fühle mich nach dem Schlaf nicht richtig erholt, \nIch bin bei der Arbeit oft müde aufgrund eines ungenügenden Schlafes"
                },
                {
                    "id": 24,
                    "category": "handling",
                    "title": "Entspannung",
                    "type": "oneSided",
                    "mintext": "Zu wenig",
                    "midtext": "Optimal",
                    "maxtext": "n/a",
                    "exptext": "Ich führe keinerlei Entspannungsübungen durch, \nErholende Freizeitaktivitäten kommen bei mir zu kurz"
                },
                {
                    "id": 25,
                    "category": "handling",
                    "title": "Körperliche Aktivität",
                    "type": "twoSided",
                    "mintext": "Zu wenig",
                    "midtext": "Ausgewogen",
                    "maxtext": "Zu viel",
                    "exptext": "Ich bewege mich im Alltag zu wenig, \nIch bin während der Arbeit oft müde vom intensiven Sporttraining"
                },
                {
                    "id": 26,
                    "category": "handling",
                    "title": "Sozialer Austausch",
                    "type": "twoSided",
                    "mintext": "Zu wenig",
                    "midtext": "Ausgewogen",
                    "maxtext": "Zu viel"
                },
                {
                    "id": 27,
                    "category": "handling",
                    "title": "Ernährung",
                    "type": "oneSided",
                    "mintext": "Ungesund",
                    "midtext": "Ausgewogen",
                    "maxtext": "n/a",
                    "exptext": "Ich ernähre mich oft während der Arbeit nur mit Fast Food, \nIch esse stressbedingt unregelmässig/zu viel/zu wenig, Ich trinke stressbedingt zu viel Alkohol"
                }

            ]
        }
    ]

};

mock.assessmentAnswers = [];

mock.stressLevelStatus =
{
    "cols": [
    {"id": "stressSection", "label": "Bereich", "type": "string"},
    {"id": "stressValue", "label": "Wert", "type": "number"}
],
    "rows": [
    {"c": [
        {"v": "Allgemein"},
        {"v": 3}
    ]},
    {"c": [
        {"v": "Arbeitsplatz"},
        {"v": 4}
    ]},
    {"c": [
        {"v": "Typ"},
        {"v": 2}

    ]},
    {"c": [
        {"v": "Bewältigung"},
        {"v": 1}

    ]}
]};

mock.activitystats = {};

mock.activitystats.yearly =
{"cols": [
    {"id": "actionCluster", "label": "Aktivitätsbereich", "type": "string"},
    {"id": "done-id", "label": "durchgeführt", "type": "number"},
    {"id": "missed-id", "label": "verpasst", "type": "number"}
], "rows": [
    {"c": [
        {"v": "Allgemein"},
        {"v": 182, "f": "Alle geplanten Aktivitäten durchgeführt!"},
        {"v": 22}
    ]},
    {"c": [
        {"v": "Fitness"},
        {"v": 510, "f": "Vorbildiche Fitness!"},
        {"v": 51, "f": "Möglicherweise wolltest du zuviel?"}
    ]},
    {"c": [
        {"v": "Konsum"},
        {"v": 96, "f": "Weiter so!"},
        {"v": 22, "f": "Weniger ist oft mehr..."}

    ]},
    {"c": [
        {"v": "Wohlbefinden"},
        {"v": 16},
        {"v": 8}

    ]},
    {"c": [
        {"v": "Behandlungen"},
        {"v": 12},
        {"v": 2}

    ]}
]};

mock.activitystats.monthly =
{"cols": [
    {"id": "actionCluster", "label": "Aktivitätsbereich", "type": "string"},
    {"id": "done-id", "label": "durchgeführt", "type": "number"},
    {"id": "missed-id", "label": "verpasst", "type": "number"}
], "rows": [
    {"c": [
        {"v": "Allgemein"},
        {"v": 18, "f": "Alle geplanten Aktivitäten durchgeführt!"},
        {"v": 0}
    ]},
    {"c": [
        {"v": "Fitness"},
        {"v": 50, "f": "Vorbildiche Fitness!"},
        {"v": 5, "f": "Möglicherweise wolltest du zuviel?"}
    ]},
    {"c": [
        {"v": "Konsum"},
        {"v": 24, "f": "Weiter so!"},
        {"v": 12, "f": "Weniger ist oft mehr..."}

    ]},
    {"c": [
        {"v": "Wohlbefinden"},
        {"v": 4},
        {"v": 8}

    ]},
    {"c": [
        {"v": "Behandlungen"},
        {"v": 2},
        {"v": 0}

    ]}
]};

mock.activitystats.weekly =
{"cols": [
    {"id": "actionCluster", "label": "Aktivitätsbereich", "type": "string"},
    {"id": "done-id", "label": "durchgeführt", "type": "number"},
    {"id": "missed-id", "label": "verpasst", "type": "number"}
], "rows": [
    {"c": [
        {"v": "Allgemein"},
        {"v": 9, "f": "Alle geplanten Aktivitäten durchgeführt!"},
        {"v": 0}
    ]},
    {"c": [
        {"v": "Fitness"},
        {"v": 25, "f": "Vorbildiche Fitness!"},
        {"v": 5, "f": "Möglicherweise wolltest du zuviel?"}
    ]},
    {"c": [
        {"v": "Konsum"},
        {"v": 12, "f": "Weiter so!"},
        {"v": 12, "f": "Weniger ist oft mehr..."}

    ]},
    {"c": [
        {"v": "Wohlbefinden"},
        {"v": 2},
        {"v": 8}

    ]},
    {"c": [
        {"v": "Behandlungen"},
        {"v": 2},
        {"v": 0}

    ]}
]};

mock.campaigns = [
    {
        id: "asdfasfwf2323f2332",
        title: "Schindler WorkLife-Balance Kampagne",
        startDate: "2013-09-10T12:00:00.000Z",
        endDate: "2013-10-25T12:00:00.000Z",
        campaignCommunity: {
            id: "09893453451we",
            name: "default Community"
        },
        healthpromoter: {
            id: "3412341234",
            name: "Schindler AG",
            type: "company"
        },
        topic: {
            id: "1234123345",
            name: "WorkLife-Balance"
        },

        stats: {
            // Abschnitt über Anzahl Personen in der Kampagne
            individuals: {
                // wieviele sind der Kampagne beigetreten, total und pro Tag der laufenden Kampagne
                joined: {
                    // total bisher beigetreten
                    total: 150,
                    // Anzahl Beitritte pro Tag
                    perDay: [4, 21, 35, 30, 20, 5, 5, 4, 0, 0, 0, 22, 4, 0]
                },
                active: {
                    // Anzahl aktive User pro Tag, wieviele haben sich an einem Tag eingeloggt.
                    perDay: [4, 22, 50, 80, 70, 75, 90, 80, 65, 56, 54, 40, 34, 60]
                }
            },

            // Abschnitt zu den Aktivitäten
            activities: {
                all: {
                    // geplante Aktivitäten
                    planned: {
                        total: 789,
                        perDay: [8, 42, 70, 70, 30, 10, 5, 9, 20, 25]
                    },
                    eventsDone: {
                        // ausgeführte AktivitätsTermine
                        total: 1344,
                        perDay: [8, 42, 70, 70, 30, 10, 5, 9, 20, 25]
                    },
                    // nicht ausgeführte AktivitätsTermine
                    eventsMissed: {
                        total: 812,
                        perDay: [8, 42, 70, 70, 30, 10, 5, 9, 20, 25]
                    },
                    // durchschnittliche Beurteilung der Aktivitäten
                    avgRating: {
                        total: 3.8,
                        trend: [4.3, 4.1, 4.0, 4.1, 3.9, 4.3, 4.1, 4.0, 4.1, 3.9, 4.3, 4.1, 4.0, 4.1, 3.9]
                    }

                },
                // dasselbe, aber nur für die Kampagnen-Spezifischen Aktivitäten
                campaignSpecific: {
                    planned: {
                        perDay: [8, 42, 70, 70, 30, 10, 5, 9, 20, 25]
                    },
                    eventsDone: {
                        perDay: [8, 42, 70, 70, 30, 10, 5, 9, 20, 25]
                    },
                    eventsMissed: {
                        perDay: [8, 42, 70, 70, 30, 10, 5, 9, 20, 25]
                    },
                    avgRating: {
                        total: 4.4,
                        trend: [4.3, 4.1, 4.0, 4.1, 3.9, 4.3, 4.1, 4.0, 4.1, 3.9, 4.3, 4.1, 4.0, 4.1, 4.4]
                    }

                },
                // Top Aktivitäten in der Kampagne
                topActivities: [
                    {
                        id: "123121234",
                        name: "Esse einen Apfel",
                        stats: {
                            campaignCommunity: {
                                planned: 123,
                                eventsDone: 160,
                                eventsMissed: 103,
                                avgRating: 4.8
                            }
                        }
                    },
                    {
                        id: "234898",
                        name: "Vegi Menu Aktion Schindler Mensa",
                        stats: {
                            campaignCommunity: {
                                planned: 123,
                                eventsDone: 160,
                                eventsMissed: 103,
                                avgRating: 4.8
                            }
                        }
                    },
                    {
                        id: "90909",
                        name: "Jogging über Mittag",
                        stats: {
                            campaignCommunity: {
                                planned: 123,
                                eventsDone: 160,
                                eventsMissed: 103,
                                avgRating: 4.8
                            }
                        }
                    }


                ]
            },
            // Abschnitt zum Assessment
            assessment: {
                done: {
                    // total Personen, die das Assessment ausgefüllt haben
                    total: 120,
                    // Anzahl updates pro Tag
                    updatesPerDay: [3, 12, 34, 23, 12, 10, 12, 12, 5, 2, 1, 34, 10]
                },
                result: {
                    // Allgemeiner Stresslevel und Entwicklung pro Tag
                    generalLevel: {
                        currentAvg: 78,
                        trend: ['', -34, -20, -10, 0, 4, 23, 45, 67, 55, 78, 79, 78]
                    },
                    topStressoren: [
                        {
                            title: "Arbeitsmenge",
                            avg: 79,        // durchschnittliche Ausprägugung
                            impacted: 60    // Anzahl Betroffene im Betrieb mit Ausprägung über 50
                        },
                        {
                            title: "Betriebsklima",
                            avg: 76,        // durchschnittliche Ausprägugung
                            impacted: 40    // Anzahl Betroffene im Betrieb mit Ausprägung über 50
                        },
                        {
                            title: "Kontrollbedürfnis",
                            avg: 72,        // durchschnittliche Ausprägugung
                            impacted: 30    // Anzahl Betroffene im Betrieb mit Ausprägung über 50
                        }
                    ]
                }
            }
        }

    }
];

mock.socialLog = [
    {
        "type": "community",
        "status": "newMessage",
        "avatar": "assets/img/UBAU.jpeg",
        "authorFirstName": "Urs",
        "authorFamilyName": "Baumeler",
        "area": "Bewegung",
        "activity": "Joggen über Mittag",
        "comment": "Bin auch dabei",
        "timestamp": "2013-08-20T11:25:00.000Z"
    },
    {
        "type": "community",
        "status": "newMessage",
        "avatar": "assets/img/IRIG.jpeg",
        "authorFirstName": "Ivan",
        "authorFamilyName": "Rigamonti",
        "area": "Bewegung",
        "activity": "Joggen über Mittag",
        "comment": "Kann leider nicht, bin ausser Haus.",
        "timestamp": "2013-08-20T11:22:00.000Z"
    },
    {
        "type": "youpers",
        "status": "newMessage",
        "avatar": "assets/img/YouPersAvatar.png",
        "authorFirstName": "YouPers",
        "authorFamilyName": "Tipps",
        "area": "Ernährung",
        "activity": "Kohlenhydratarme Kost",
        "comment": "Neue attraktive Ernährungsvorschläge!",
        "timestamp": "2013-08-20T09:15:00.000Z"
    },
    {
        "type": "community",
        "status": "newMessage",
        "avatar": "assets/img/RBLU.jpeg",
        "authorFirstName": "Reto",
        "authorFamilyName": "Blunschi",
        "area": "Bewegung",
        "activity": "Joggen über Mittag",
        "comment": "Welche Route heute?",
        "timestamp": "2013-08-20T09:07:00.000Z"
    },
    {
        "type": "community",
        "status": "newMessage",
        "avatar": "assets/img/SMUE.jpeg",
        "authorFirstName": "Stefan",
        "authorFamilyName": "Müller",
        "area": "Bewegung",
        "activity": "Joggen über Mittag",
        "comment": "Wer ist mit von der Partie?",
        "timestamp": "2013-08-20T08:15:00.000Z"
    },
    {
        "type": "community",
        "status": "readMessage",
        "avatar": "assets/img/UBAU.jpeg",
        "authorFirstName": "Urs",
        "authorFamilyName": "Baumeler",
        "area": "Bewegung",
        "activity": "Joggen über Mittag",
        "comment": "Kann dir nur zustimmen!",
        "timestamp": "2013-08-17T16:35:00.000Z"
    },
    {
        "type": "community",
        "status": "readMessage",
        "avatar": "assets/img/SMUE.jpeg",
        "authorFirstName": "Stefan",
        "authorFamilyName": "Müller",
        "area": "Bewegung",
        "activity": "Joggen über Mittag",
        "comment": "Wetter und Strecke waren einfach genial heute!",
        "timestamp": "2013-08-17T14:22:00.000Z"
    }
];

mock.activityLog = [
    {
        "id": "Act-1",
        "title": "Tägliche Selbsteinschätzung des aktuellen Stresslevels",
        "source": "community",
        "planType": "daily",
        "executionType": "self",
        "visibility": "private",
        "topics": [
            "workLifeBalance"
        ],
        "activityFields": [
            "AwarenessAbility"
        ],
        "activityHistory": [
            {
                "id": "1",
                "status": "done",
                "type": "past",
                "nofComments": "1",
                "feedback": "2",
                "on": "2013-08-06T18:30:00.000Z",
                "comments": [
                    {
                        "id": "1",
                        "author": {
                            "id": "1",
                            "fullname": "Urs Baumeler",
                            "pic": "assets/img/UBAU.jpeg",
                            "link": "#/u/UBAU"
                        },
                        "date": "2013-08-06T18:00:00.000Z",
                        "text": "Na ja, mein Stresslevel sieht nicht allzu positiv aus, leider."
                    }
                ]
            }
        ]
    },
    {
        "id": "Act-04",
        "title": "Durchführung Stress Self Assessment um Stressursachen zu eruieren ",
        "source": "community",
        "planType": "once",
        "executionType": "self",
        "visibility": "private",
        "topics": [
            "workLifeBalance"
        ],
        "activityFields": [
            "AwarenessAbility"
        ],
        "activityHistory": [
            {
                "id": "1",
                "status": "done",
                "type": "past",
                "nofComments": "1",
                "feedback": "4",
                "on": "2013-08-04T18:33:50.558Z",
                "comments": [
                    {
                        "id": "1",
                        "author": {
                            "id": "1",
                            "fullname": "Urs Baumeler",
                            "pic": "assets/img/UBAU.jpeg",
                            "link": "#/u/UBAU"
                        },
                        "date": "2013-08-04T18:33:50.558Z",
                        "text": "Ich glaube, alle für mich relevanten Stressursachen gefunden zu haben."
                    }
                ]
            }
        ]
    },
    {
        "id": "Act-05",
        "title": "Durchführung Stress Self Assessment um stressfördernde Haltungen zu erkennen",
        "source": "community",
        "planType": "once",
        "executionType": "self",
        "visibility": "private",
        "topics": [
            "workLifeBalance"
        ],
        "activityFields": [
            "AwarenessAbility"
        ],
        "activityHistory": [
            {
                "id": "1",
                "status": "done",
                "type": "past",
                "nofComments": "1",
                "feedback": "2",
                "on": "2013-08-04T18:33:50.558Z",
                "comments": [
                    {
                        "id": "1",
                        "author": {
                            "id": "1",
                            "fullname": "Urs Baumeler",
                            "pic": "assets/img/UBAU.jpeg",
                            "link": "#/u/UBAU"
                        },
                        "date": "2013-08-04T18:33:50.558Z",
                        "text": "Das ist aber gar nicht einfach!"
                    }
                ]
            },
            {
                "id": "2",
                "status": "done",
                "type": "past",
                "nofComments": "1",
                "feedback": "4",
                "on": "2013-07-23T12:15:00.000Z",
                "comments": [
                    {
                        "id": "1",
                        "author": {
                            "id": "1",
                            "fullname": "Urs Baumeler",
                            "pic": "assets/img/UBAU.jpeg",
                            "link": "#/u/UBAU"
                        },
                        "date": "2013-08-04T18:33:50.558Z",
                        "text": "Jetzt glaube ich, diesbezüglich weitergekommen zu sein."
                    }
                ]
            }
        ]
    },
    {
        "id": "Act-66",
        "title": "Jogging mit Kollegen über Mittag",
        "text": "http://www.gesundheitsfoerderung.ch/pdf_doc_xls/f/gesundheitsfoerderung_promotion_staerken/Grundlagen_Wissen/entspannungsbericht_d.pdf ",
        "source": "youpers",
        "planType": "weekly_on_Thursday",
        "executionType": "group",
        "visibility": "campaign",
        "topics": [
            "workLifeBalance"
        ],
        "activityFields": [
            "Breaks",
            "SocialInteraction"
        ],
        "activityHistory": [
            {
                "id": "1",
                "status": "done",
                "type": "past",
                "nofComments": "2",
                "feedback": "2",
                "on": "2013-07-16T18:33:50.558Z",
                "comments": [
                    {
                        "id": "1",
                        "author": {
                            "id": "2",
                            "fullname": "Ivan Rigamonti",
                            "pic": "assets/img/IRIG.jpeg",
                            "link": "#/u/IRIG"
                        },
                        "date": "2013-07-16T18:33:50.558Z",
                        "text": "Keine Zeit am Mittwoch"
                    },
                    {
                        "id": "2",
                        "author": {
                            "id": "3",
                            "fullname": "Stefan Müller",
                            "pic": "assets/img/SMUE.jpeg",
                            "link": "#/u/SMUE"
                        },
                        "date": "2013-07-16T18:33:50.558Z",
                        "text": "Ist mir zu langsam mit dir ;-)"
                    }
                ]
            },
            {
                "id": "2",
                "status": "done",
                "type": "past",
                "nofComments": "3",
                "feedback": "3",
                "on": "2013-07-23T12:15:00.000Z",
                "comments": [
                    {
                        "id": "1",
                        "author": {
                            "id": "2",
                            "fullname": "Ivan Rigamonti",
                            "pic": "assets/img/IRIG.jpeg",
                            "link": "#/u/IRIG"
                        },
                        "date": "2013-07-23T12:15:00.000Z",
                        "text": "Keine Zeit am Mittwoch"
                    },
                    {
                        "id": "2",
                        "author": {
                            "id": "3",
                            "fullname": "Stefan Müller",
                            "pic": "assets/img/SMUE.jpeg",
                            "link": "#/u/SMUE"
                        },
                        "date": "2013-07-23T12:15:00.000Z",
                        "text": "Ist mir zu langsam mit dir ;-)"
                    },
                    {
                        "id": "3",
                        "author": {
                            "id": "3",
                            "fullname": "Stefan Müller",
                            "pic": "assets/img/SMUE.jpeg",
                            "link": "#/u/SMUE"
                        },
                        "date": "2013-07-23T12:15:00.000Z",
                        "text": "Ist mir zu langsam mit dir ;-)"
                    }
                ]
            },
            {
                "id": "3",
                "status": "done",
                "type": "past",
                "nofComments": "3",
                "feedback": "4",
                "on": "2013-07-30T12:15:00.000Z",
                "comments": [
                    {
                        "id": "1",
                        "author": {
                            "id": "2",
                            "fullname": "Ivan Rigamonti",
                            "pic": "assets/img/IRIG.jpeg",
                            "link": "#/u/IRIG"
                        },
                        "date": "2013-07-30T12:15:00.000Z",
                        "text": "Keine Zeit am Mittwoch"
                    },
                    {
                        "id": "2",
                        "author": {
                            "id": "3",
                            "fullname": "Stefan Müller",
                            "pic": "assets/img/SMUE.jpeg",
                            "link": "#/u/SMUE"
                        },
                        "date": "2013-07-30T12:15:00.000Z",
                        "text": "Ist mir zu langsam mit dir ;-)"
                    },
                    {
                        "id": "3",
                        "author": {
                            "id": "3",
                            "fullname": "Stefan Müller",
                            "pic": "assets/img/SMUE.jpeg",
                            "link": "#/u/SMUE"
                        },
                        "date": "2013-07-30T12:15:00.000Z",
                        "text": "Ist mir zu langsam mit dir ;-)"
                    },
                    {
                        "id": "4",
                        "author": {
                            "id": "3",
                            "fullname": "Stefan Müller",
                            "pic": "assets/img/SMUE.jpeg",
                            "link": "#/u/SMUE"
                        },
                        "date": "2013-07-30T12:15:00.000Z",
                        "text": "Ist mir zu langsam mit dir ;-)"
                    }
                ]
            },
            {
                "id": "4",
                "status": "not done",
                "type": "past",
                "nofComments": "1",
                "feedback": "1",
                "on": "2013-08-06T11:45:00.000Z",
                "comments": [
                    {
                        "id": "1",
                        "author": {
                            "id": "3",
                            "fullname": "Urs Baumeler",
                            "pic": "assets/img/UBAU.jpeg",
                            "link": "#/u/UBAU"
                        },
                        "date": "2013-08-06T18:33:50.558Z",
                        "text": "Schade, dass ich verletzt bin..."
                    }
                ]

            },
            {
                "id": "5",
                "status": "done",
                "type": "past",
                "nofComments": "7",
                "feedback": "5",
                "on": "2013-08-13T12:15:00.000Z",
                "comments": [
                    {
                        "id": "1",
                        "author": {
                            "id": "2",
                            "fullname": "Ivan Rigamonti",
                            "pic": "assets/img/IRIG.jpeg",
                            "link": "#/u/IRIG"
                        },
                        "date": "2013-08-04T18:33:50.558Z",
                        "text": "Keine Zeit am Mittwoch"
                    },
                    {
                        "id": "2",
                        "author": {
                            "id": "3",
                            "fullname": "Stefan Müller",
                            "pic": "assets/img/SMUE.jpeg",
                            "link": "#/u/SMUE"
                        },
                        "date": "2013-08-05T18:33:50.558Z",
                        "text": "Ist mir zu langsam mit dir ;-)"
                    },
                    {
                        "id": "3",
                        "author": {
                            "id": "3",
                            "fullname": "Stefan Müller",
                            "pic": "assets/img/SMUE.jpeg",
                            "link": "#/u/SMUE"
                        },
                        "date": "2013-08-05T18:33:50.558Z",
                        "text": "Ist mir zu langsam mit dir ;-)"
                    },
                    {
                        "id": "4",
                        "author": {
                            "id": "2",
                            "fullname": "Ivan Rigamonti",
                            "pic": "assets/img/IRIG.jpeg",
                            "link": "#/u/IRIG"
                        },
                        "date": "2013-08-04T18:33:50.558Z",
                        "text": "Keine Zeit am Mittwoch"
                    },
                    {
                        "id": "5",
                        "author": {
                            "id": "3",
                            "fullname": "Stefan Müller",
                            "pic": "assets/img/SMUE.jpeg",
                            "link": "#/u/SMUE"
                        },
                        "date": "2013-08-05T18:33:50.558Z",
                        "text": "Ist mir zu langsam mit dir ;-)"
                    },
                    {
                        "id": "6",
                        "author": {
                            "id": "3",
                            "fullname": "Stefan Müller",
                            "pic": "assets/img/SMUE.jpeg",
                            "link": "#/u/SMUE"
                        },
                        "date": "2013-08-05T18:33:50.558Z",
                        "text": "Ist mir zu langsam mit dir ;-)"
                    },
                    {
                        "id": "7",
                        "author": {
                            "id": "3",
                            "fullname": "Stefan Müller",
                            "pic": "assets/img/SMUE.jpeg",
                            "link": "#/u/SMUE"
                        },
                        "date": "2013-08-06T18:33:50.558Z",
                        "text": "Ist mir zu langsam mit dir ;-)"
                    }
                ]
            },
            {
                "id": "6",
                "status": "open",
                "type": "future",
                "nofComments": "3",
                "feedback": "0",
                "on": "2013-08-20T12:00:00.000Z",
                "comments": [
                    {
                        "id": "1",
                        "author": {
                            "id": "2",
                            "fullname": "Ivan Rigamonti",
                            "pic": "assets/img/IRIG.jpeg",
                            "link": "#/u/IRIG"
                        },
                        "date": "2013-08-04T18:33:50.558Z",
                        "text": "Keine Zeit am Mittwoch"
                    },
                    {
                        "id": "2",
                        "author": {
                            "id": "3",
                            "fullname": "Stefan Müller",
                            "pic": "assets/img/SMUE.jpeg",
                            "link": "#/u/SMUE"
                        },
                        "date": "2013-08-05T18:33:50.558Z",
                        "text": "Ist mir zu langsam mit dir ;-)"
                    },
                    {
                        "id": "3",
                        "author": {
                            "id": "3",
                            "fullname": "Stefan Müller",
                            "pic": "assets/img/SMUE.jpeg",
                            "link": "#/u/SMUE"
                        },
                        "date": "2013-08-06T18:33:50.558Z",
                        "text": "Ist mir zu langsam mit dir ;-)"
                    }
                ]
            },
            {
                "id": "7",
                "status": "open",
                "type": "future",
                "nofComments": "0",
                "feedback": "0",
                "on": "2013-08-27T12:00:00.000Z",
                "comments": [
                ]
            },
            {
                "id": "8",
                "status": "open",
                "type": "future",
                "nofComments": "0",
                "feedback": "0",
                "on": "2013-09-03T12:00:00.000Z",
                "comments": [
                ]
            },
            {
                "id": "9",
                "status": "open",
                "type": "future",
                "nofComments": "0",
                "feedback": "0",
                "on": "2013-09-10T12:00:00.000Z",
                "comments": [
                ]
            },
            {
                "id": "10",
                "status": "open",
                "type": "future",
                "nofComments": "0",
                "feedback": "0",
                "on": "2013-09-17T12:00:00.000Z",
                "comments": [
                ]
            },
            {
                "id": "11",
                "status": "open",
                "type": "future",
                "nofComments": "0",
                "feedback": "0",
                "on": "2013-09-24T12:00:00.000Z",
                "comments": [
                ]
            },
            {
                "id": "12",
                "status": "open",
                "type": "future",
                "nofComments": "0",
                "feedback": "0",
                "on": "2013-10-01T12:00:00.000Z",
                "comments": [
                ]
            }
        ]

    }

];