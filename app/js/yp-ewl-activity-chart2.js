'use strict';

angular.module('yp.ewl.activity.chart2', [])

    .factory('yp.ewl.activity.chart2.service', ['$http', function($http) {

        var valuesThisWeek = $http.get('activitystats?range=weekly')
            .then(function (result) {
                return result.data;
            });

        var valuesThisMonth = $http.get('activitystats?range=monthly')
            .then(function (result) {
                return result.data;
            });

        var valuesThisYear = $http.get('activitystats?range=yearly')
            .then(function (result) {
                return result.data;
            });

        var ActivityChartService = {
            activitiesThisWeek: valuesThisWeek,
            activitiesThisMonth: valuesThisMonth,
            activitiesThisYear: valuesThisYear
        };

        return ActivityChartService;

    }])

    .controller('yp.ewl.activity.chart2.controller', ['$scope', 'yp.ewl.activity.chart2.service', function ($scope, ActivityChartService) {

        $scope.d3Data = [
            {label: "Allgemein", value: 122},
            {label: "Fitness", value: 205},
            {label: 'Konsum', value: 96},
            {label: "Wohlbefinden", value: 66},
            {label: "Behandlungen", value: 42}
        ];

        $scope.d3Options = {
//            compressed: "no",
//            chartHeight: "250",
            chartWidth: "99%"
        };

        $scope.chart = {};

        ActivityChartService.activitiesThisWeek.then(function (data) {
            $scope.chart.dataCurrentWeek = data;
            $scope.chart.data = data; // default value
        });

        ActivityChartService.activitiesThisMonth.then(function (data) {
            $scope.chart.dataCurrentMonth = data;
        });

        ActivityChartService.activitiesThisYear.then(function (data) {
            $scope.chart.dataCurrentYear = data;
        });

        $scope.chart.type = "ColumnChart";
        $scope.chart.displayed = false;
        $scope.chart.cssStyle = "height:250px; width:100%;";

        $scope.chart.options = {
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

    }]);
