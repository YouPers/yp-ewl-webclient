'use strict';

angular.module('yp.ewl.activity.chart', ['googlechart'])

    .service    ('yp.ewl.activity.chart.service', ['$http', function($http) {

        var valuesThisWeek = $http.get('js/mockdata/test-activities-this-week.json').then(function (result) {
            return result.data;
        });

        var valuesThisMonth = $http.get('js/mockdata/test-activities-this-month.json').then(function (result) {
            return result.data;
        });

        var valuesThisYear = $http.get('js/mockdata/test-activities-this-year.json').then(function (result) {
            return result.data;
        });

        var ActivityChartService = {
            activitiesThisWeek: valuesThisWeek,
            activitiesThisMonth: valuesThisMonth,
            activitiesThisYear: valuesThisYear
        };

        return ActivityChartService;

    }])

    .controller('yp.ewl.activity.chart.controller', ['$scope', 'yp.ewl.activity.chart.service', function ($scope, ActivityChartService) {

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
