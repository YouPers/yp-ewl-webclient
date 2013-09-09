'use strict';

angular.module('yp.ewl.cockpit-action-chart', ['googlechart']).controller("CockpitActionChartCtrl", function ($scope) {

    var dataCurrentWeek = {"cols": [
        {id: "actionCluster", label: "Aktivitätsbereich", type: "string"},
        {id: "done-id", label: "durchgeführt", type: "number"},
        {id: "missed-id", label: "verpasst", type: "number"}
    ], "rows": [
        {c: [
            {v: "Allgemein"},
            {v: 9, f: "Alle geplanten Aktivitäten durchgeführt!"},
            {v: 0}
        ]},
        {c: [
            {v: "Fitness"},
            {v: 25, f: "Vorbildiche Fitness!"},
            {v: 5, f: "Möglicherweise wolltest du zuviel?"}
        ]},
        {c: [
            {v: "Konsum"},
            {v: 12, f: "Weiter so!"},
            {v: 12, f: "Weniger ist oft mehr..."}

        ]},
        {c: [
            {v: "Wohlbefinden"},
            {v: 2},
            {v: 8}

        ]},
        {c: [
            {v: "Behandlungen"},
            {v: 2},
            {v: 0}

        ]}
    ]};

    var dataCurrentMonth = {"cols": [
        {id: "actionCluster", label: "Aktivitätsbereich", type: "string"},
        {id: "done-id", label: "durchgeführt", type: "number"},
        {id: "missed-id", label: "verpasst", type: "number"}
    ], "rows": [
        {c: [
            {v: "Allgemein"},
            {v: 18, f: "Alle geplanten Aktivitäten durchgeführt!"},
            {v: 0}
        ]},
        {c: [
            {v: "Fitness"},
            {v: 50, f: "Vorbildiche Fitness!"},
            {v: 5, f: "Möglicherweise wolltest du zuviel?"}
        ]},
        {c: [
            {v: "Konsum"},
            {v: 24, f: "Weiter so!"},
            {v: 12, f: "Weniger ist oft mehr..."}

        ]},
        {c: [
            {v: "Wohlbefinden"},
            {v: 4},
            {v: 8}

        ]},
        {c: [
            {v: "Behandlungen"},
            {v: 2},
            {v: 0}

        ]}
    ]};

    var dataCurrentYear = {"cols": [
        {id: "actionCluster", label: "Aktivitätsbereich", type: "string"},
        {id: "done-id", label: "durchgeführt", type: "number"},
        {id: "missed-id", label: "verpasst", type: "number"}
    ], "rows": [
        {c: [
            {v: "Allgemein"},
            {v: 182, f: "Alle geplanten Aktivitäten durchgeführt!"},
            {v: 22}
        ]},
        {c: [
            {v: "Fitness"},
            {v: 510, f: "Vorbildiche Fitness!"},
            {v: 51, f: "Möglicherweise wolltest du zuviel?"}
        ]},
        {c: [
            {v: "Konsum"},
            {v: 96, f: "Weiter so!"},
            {v: 22, f: "Weniger ist oft mehr..."}

        ]},
        {c: [
            {v: "Wohlbefinden"},
            {v: 16},
            {v: 8}

        ]},
        {c: [
            {v: "Behandlungen"},
            {v: 12},
            {v: 2}

        ]}
    ]};

    var chart1 = {};

    chart1.type = "ColumnChart";
//    chart1.timespan = "Week";
    chart1.displayed = false;
    chart1.cssStyle = "height:250px; width:100%;";
    chart1.data = dataCurrentWeek; // default: week
    chart1.dataCurrentWeek = dataCurrentWeek;
    chart1.dataCurrentMonth = dataCurrentMonth;
    chart1.dataCurrentYear = dataCurrentYear;

    chart1.options = {
        "title": "Aktivitäten je Bereich",
        "isStacked": "true",
        "fontName": "Dosis",
        "fill": 20,
        "displayExactValues": true,
        "vAxis": {
            "title": "Anzahl Aktivitäten",
            "gridlines": {"count": 5},
            "titleTextStyle": {italic: false}
        },
        "hAxis": {
            "title": "Bereiche",
            "titleTextStyle": {italic: false},
            "slantedText": true
        }
    };

    $scope.chart = chart1;

});
