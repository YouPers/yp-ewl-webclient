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
        "avatar": "assets/img/RBLU.jpeg",
        "email": "reto@blunschi.ch",
        "emailValidatedFlag": true,
        "firstname": "Reto",
        "fullname": "Reto Blunschi",
        "hashed_password": "cc92b76ae74392ba23606345757ad5514715ed4a",
        "id": "525fb247101e330000000005",
        "lastname": "Blunschi",
        "role": "admin",
        "tempPasswordFlag": false,
        "username": "reto",
        "version": 0
    },
    {
        "avatar": "assets/img/IRIG.jpeg",
        "email": "ivan@rigamonti.me",
        "emailValidatedFlag": true,
        "firstname": "Ivan",
        "fullname": "Ivan Rigamonti",
        "hashed_password": "8f7e90c4a6f292e73bba8d4b83f335cbde0c61a2",
        "id": "525fb247101e330000000006",
        "lastname": "Rigamonti",
        "role": "admin",
        "tempPasswordFlag": false,
        "username": "ivan",
        "version": 0
    },
    {
        "avatar": "assets/img/UBAU.jpeg",
        "email": "urs@baumeler.com",
        "emailValidatedFlag": true,
        "firstname": "Urs",
        "fullname": "Urs Baumeler",
        "hashed_password": "5c50a547afa365a64cf6a0bbd364ef02ee3799a6",
        "id": "525fb247101e330000000007",
        "lastname": "Baumeler",
        "role": "healthpromoter",
        "tempPasswordFlag": false,
        "username": "urs",
        "version": 0
    },
    {
        "avatar": "assets/img/SMUE.jpeg",
        "email": "stefan.mueller@romus.ch",
        "emailValidatedFlag": true,
        "firstname": "Stefan",
        "fullname": "Stefan Müller",
        "hashed_password": "f1426d87c07eb64837334f685a620c37ead36601",
        "id": "525fb247101e330000000008",
        "lastname": "Müller",
        "role": "individual",
        "tempPasswordFlag": false,
        "username": "stefan",
        "version": 0
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
        "id": "525faf0ac558d40000000005",
        "name": "ASSESS_YOUR_STRESS_LEVEL",
        "questionCats": [
            {
                "category": "GENERAL_STRESSLEVEL",
                "id": "5261c2cb87c07e0000000023",
                "questions": [
                    {
                        "category": "general",
                        "exptext": "tbd",
                        "id": "5261c2cb87c07e0000000024",
                        "maxtext": "Überfordernd/Frustrierend",
                        "midtext": "Ausgewogen / positiver, motivierender Stress",
                        "mintext": "Unterfordernd/Langweilig",
                        "title": "Stresslevel",
                        "type": "twoSided"
                    }
                ]
            },
            {
                "category": "AT_WORK",
                "id": "5261c2cb87c07e0000000017",
                "questions": [
                    {
                        "category": "work",
                        "exptext": "Zur Bewältigung meiner Arbeitsmenge muss ich lange arbeiten / Überzeit leisten / mit hohem Tempo arbeiten; Ich arbeite ständig unter einem grossen Leistungs- bzw. Zeitdruck, Für eine seriöse Planung und Organisation der Arbeit fehlt mir die Zeit, Mein privates Leben kommt verursacht durch die berufliche Beanspruchung zu kurz",
                        "id": "5261c2cb87c07e0000000022",
                        "maxtext": "Erdrückend",
                        "midtext": "Gerade richtig",
                        "mintext": "Ungenügend",
                        "title": "Arbeitsmenge",
                        "type": "twoSided"
                    },
                    {
                        "category": "work",
                        "exptext": "Die Erwartungen an meine Arbeitsergebnisse/-qualität sind sehr hoch; Ich stehe unter hohem Erfolgsdruck",
                        "id": "5261c2cb87c07e0000000021",
                        "maxtext": "Zu viel",
                        "midtext": "Optimal",
                        "mintext": "Zu wenig",
                        "title": "Erfolgsdruck",
                        "type": "twoSided"
                    },
                    {
                        "category": "work",
                        "exptext": "Es gibt keine Unterstützung, wenn ich sie brauche, Ich werde von meinem Vorgesetzten \"überbetreut\"",
                        "id": "5261c2cb87c07e0000000020",
                        "maxtext": "Zu viel",
                        "midtext": "Gerade richtig",
                        "mintext": "Zu wenig",
                        "title": "Unterstützung",
                        "type": "twoSided"
                    },
                    {
                        "category": "work",
                        "exptext": "Ich habe keinen Einfluss auf die Planung und Gestaltung meiner Arbeit, Ich habe zu wenig Entscheidungsfreiheit, Meine Arbeitsgestaltung ist weitgehend Fremdbestimmt",
                        "id": "5261c2cb87c07e000000001f",
                        "maxtext": "Zu viel",
                        "midtext": "Gerade richtig",
                        "mintext": "Zu wenig",
                        "title": "Selbstbestimmung",
                        "type": "twoSided"
                    },
                    {
                        "category": "work",
                        "exptext": "Viele Störungen, viele Sitzungen, grosser administrativer Aufwand, Lärm, Enge, Grossraumbüro, Raumklima/Temperatur, körperliche Belastung",
                        "id": "5261c2cb87c07e000000001e",
                        "maxtext": "n/a",
                        "midtext": "Optimal",
                        "mintext": "Schlecht",
                        "title": "Arbeitsbedingungen",
                        "type": "oneSided"
                    },
                    {
                        "category": "work",
                        "exptext": "Die mir gestellten Ziele und Aufgaben überfordern mich, Ich erlebe zu viel Routine, Es fehlt die Herausforderung, Ich empfinde meine Arbeit als langweilig",
                        "id": "5261c2cb87c07e000000001d",
                        "maxtext": "Überfordernd",
                        "midtext": "Ausgewogen",
                        "mintext": "Unterfordernd",
                        "title": "Arbeitsanforderungen",
                        "type": "twoSided"
                    },
                    {
                        "category": "work",
                        "exptext": "Meine Arbeit entspricht überhaupt nicht meinen eigentlichen Interessen und Neigungen",
                        "id": "5261c2cb87c07e000000001c",
                        "maxtext": "Zu hoch",
                        "midtext": "Ausgewogen",
                        "mintext": "Zu gering",
                        "title": "Arbeitsidentifikation",
                        "type": "twoSided"
                    },
                    {
                        "category": "work",
                        "exptext": "Ich bekomme kein echtes Feedback (fehlende Anerkennung und mangelnde konstruktive Kritik), Meine Vorschläge, Anregungen, Kritik werden nicht ernst genommen",
                        "id": "5261c2cb87c07e000000001b",
                        "maxtext": "Übertrieben",
                        "midtext": "Gut",
                        "mintext": "Zu wenig",
                        "title": "Anerkennung",
                        "type": "twoSided"
                    },
                    {
                        "category": "work",
                        "id": "5261c2cb87c07e000000001a",
                        "maxtext": "Zu viel",
                        "midtext": "Optimal",
                        "mintext": "Zu wenig",
                        "title": "Entwicklungsmöglichkeiten",
                        "type": "twoSided"
                    },
                    {
                        "category": "work",
                        "exptext": "Ungelöste Konflikte belasten mich, Es herrscht ein schlechtes Betriebsklima in meinem Umfeld, Ich werde gemobbt, Ich werde diskriminiert",
                        "id": "5261c2cb87c07e0000000019",
                        "maxtext": "Übermotivierend",
                        "midtext": "Optimal",
                        "mintext": "Demotivierend",
                        "title": "Betriebsklima",
                        "type": "twoSided"
                    },
                    {
                        "category": "work",
                        "exptext": "Ich habe Angst vor einem Arbeitsplatzverlust",
                        "id": "5261c2cb87c07e0000000018",
                        "maxtext": "n/a",
                        "midtext": "hoch",
                        "mintext": "Zu gering",
                        "title": "Arbeitsplatzsicherheit",
                        "type": "oneSided"
                    }
                ]
            },
            {
                "category": "LEISURE_TIME",
                "id": "5261c2cb87c07e0000000012",
                "questions": [
                    {
                        "category": "leisure",
                        "exptext": "Kinderbetreuung, Krankenpflege, Haushaltsarbeiten, Gartenarbeiten, Vereinstätigkeiten, weitere  Verpflichtungen",
                        "id": "5261c2cb87c07e0000000016",
                        "maxtext": "Zu viele ",
                        "midtext": "Gerade richtig",
                        "mintext": "Zu wenige",
                        "title": "Freizeitverpflichtungen",
                        "type": "twoSided"
                    },
                    {
                        "category": "leisure",
                        "exptext": "Beziehungsprobleme, Trennung, Schul-/Erziehungsprobleme, Krankheit von mir/Angehörigen, Verlust eines Angehörigen",
                        "id": "5261c2cb87c07e0000000015",
                        "maxtext": "n/a",
                        "midtext": "Entlastend",
                        "mintext": "Belastend",
                        "title": "Familiäre Situation",
                        "type": "oneSided"
                    },
                    {
                        "category": "leisure",
                        "exptext": "Permanente Geldknappheit, Schulden",
                        "id": "5261c2cb87c07e0000000014",
                        "maxtext": "n/a",
                        "midtext": "gut",
                        "mintext": "Belastend",
                        "title": "Finanzielle Situation",
                        "type": "oneSided"
                    },
                    {
                        "category": "leisure",
                        "exptext": "Ich werde von meinen sozialen Umfeld zu wenig unterstützt und getragen\nNachbarschaftsprobleme",
                        "id": "5261c2cb87c07e0000000013",
                        "maxtext": "Einengend",
                        "midtext": "Optimal",
                        "mintext": "Wenig unterstützend",
                        "title": "Soziales Umfeld",
                        "type": "twoSided"
                    }
                ]
            },
            {
                "category": "STRESS_TYP",
                "id": "5261c2cb87c07e000000000c",
                "questions": [
                    {
                        "category": "stresstypus",
                        "id": "5261c2cb87c07e0000000011",
                        "maxtext": "Perfektionistisch",
                        "midtext": "Ausgewogen",
                        "mintext": "Minimalistisch",
                        "title": "Selbstanforderung",
                        "type": "twoSided"
                    },
                    {
                        "category": "stresstypus",
                        "exptext": "Zu viel: Zwanghaft",
                        "id": "5261c2cb87c07e0000000010",
                        "maxtext": "Zu viel",
                        "midtext": "Ausgewogen",
                        "mintext": "Zu wenig",
                        "title": "Kontrollbedürfnis",
                        "type": "twoSided"
                    },
                    {
                        "category": "stresstypus",
                        "exptext": "Zu wenig: Verantwortungslos, leichtsinnig, gleichgültig\nZu viel: Zu starkes Verantwortungsgefühl, zu starkes Pflichtgefühl",
                        "id": "5261c2cb87c07e000000000f",
                        "maxtext": "Zu viel",
                        "midtext": "Ausgewogen",
                        "mintext": "Zu wenig",
                        "title": "Verantwortungsbewusstsein",
                        "type": "twoSided"
                    },
                    {
                        "category": "stresstypus",
                        "exptext": "Zu viel: Überangepasst",
                        "id": "5261c2cb87c07e000000000e",
                        "maxtext": "Zu viel",
                        "midtext": "Ausgewogen",
                        "mintext": "Zu wenig",
                        "title": "Harmoniebedürfnis",
                        "type": "twoSided"
                    },
                    {
                        "category": "stresstypus",
                        "id": "5261c2cb87c07e000000000d",
                        "maxtext": "Dominierend",
                        "midtext": "Ausgewogen",
                        "mintext": "Sich unterordnend",
                        "title": "Geltungsbedürfnis",
                        "type": "twoSided"
                    }
                ]
            },
            {
                "category": "STRESS_MEASURES",
                "id": "5261c2cb87c07e0000000005",
                "questions": [
                    {
                        "category": "handling",
                        "exptext": "Keine/zu wenige/zu kurze Pausen während der Arbeit, \nZu wenig Erholungszeit am Mittag/Feierabend/Wochenende, Keine/zu wenig/zu kurze Ferien",
                        "id": "5261c2cb87c07e000000000b",
                        "maxtext": "n/a",
                        "midtext": "Optimal",
                        "mintext": "Zu wenig",
                        "title": "Pausen",
                        "type": "oneSided"
                    },
                    {
                        "category": "handling",
                        "exptext": "Ich fühle mich nach dem Schlaf nicht richtig erholt, \nIch bin bei der Arbeit oft müde aufgrund eines ungenügenden Schlafes",
                        "id": "5261c2cb87c07e000000000a",
                        "maxtext": "n/a",
                        "midtext": "Optimal",
                        "mintext": "Zu wenig",
                        "title": "Schlaf",
                        "type": "oneSided"
                    },
                    {
                        "category": "handling",
                        "exptext": "Ich führe keinerlei Entspannungsübungen durch, \nErholende Freizeitaktivitäten kommen bei mir zu kurz",
                        "id": "5261c2cb87c07e0000000009",
                        "maxtext": "n/a",
                        "midtext": "Optimal",
                        "mintext": "Zu wenig",
                        "title": "Entspannung",
                        "type": "oneSided"
                    },
                    {
                        "category": "handling",
                        "exptext": "Ich bewege mich im Alltag zu wenig, \nIch bin während der Arbeit oft müde vom intensiven Sporttraining",
                        "id": "5261c2cb87c07e0000000008",
                        "maxtext": "Zu viel",
                        "midtext": "Ausgewogen",
                        "mintext": "Zu wenig",
                        "title": "Körperliche Aktivität",
                        "type": "twoSided"
                    },
                    {
                        "category": "handling",
                        "id": "5261c2cb87c07e0000000007",
                        "maxtext": "Zu viel",
                        "midtext": "Ausgewogen",
                        "mintext": "Zu wenig",
                        "title": "Sozialer Austausch",
                        "type": "twoSided"
                    },
                    {
                        "category": "handling",
                        "exptext": "Ich ernähre mich oft während der Arbeit nur mit Fast Food, \nIch esse stressbedingt unregelmässig/zu viel/zu wenig, Ich trinke stressbedingt zu viel Alkohol",
                        "id": "5261c2cb87c07e0000000006",
                        "maxtext": "n/a",
                        "midtext": "Ausgewogen",
                        "mintext": "Ungesund",
                        "title": "Ernährung",
                        "type": "oneSided"
                    }
                ]
            }
        ],
        "version": 0
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