'use strict';

angular.module('google-chart-sample', ['googlechart']).controller("CockpitActionChartCtrl", function ($scope) {

    var chart1 = {};
    chart1.type = "ColumnChart";
    chart1.displayed = false;
    chart1.cssStyle = "height:250px; width:100%;";
    chart1.data = {"cols": [
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
