'use strict';

angular.module('yp.ewl.activity.chart2', [])

    .factory('yp.ewl.activity.chart2.service', ['$http', function($http) {

        var convertDataSeries = function (data) {
//            var cols = data.cols;
            var rows = data.rows;
            var chartData = {};
            chartData.series = [];
            for (var i = 0; i < rows.length; i++) {
                chartData.series.push( {label: rows[i].c[0].v, value: rows[i].c[1].v});
            }
            return chartData;
        };

        var valuesThisWeek = $http.get('activitystats?range=weekly')
            .then(function (result) {
                return convertDataSeries(result.data);
            });

        var valuesThisMonth = $http.get('activitystats?range=monthly')
            .then(function (result) {
                return convertDataSeries(result.data);
            });

        var valuesThisYear = $http.get('activitystats?range=yearly')
            .then(function (result) {
                return convertDataSeries(result.data);
            });

        var ActivityChartService = {
            activitiesThisWeek: valuesThisWeek,
            activitiesThisMonth: valuesThisMonth,
            activitiesThisYear: valuesThisYear
        };

        return ActivityChartService;

    }])

    .controller('yp.ewl.activity.chart2.controller', ['$scope', 'yp.ewl.activity.chart2.service', function ($scope, ActivityChartService) {

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

    }]);
