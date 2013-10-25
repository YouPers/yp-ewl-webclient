'use strict';

angular.module('yp.ewl.activity.vchart', ['restangular'])

    .factory('yp.ewl.activity.vchart.service', ['Restangular', function(Restangular) {

//        var convertDataSeries = function (data) {
//            var cols = data.cols;
//            var rows = data.rows;
//            var chartData = {};
//            chartData.series = [];
//            for (var i = 0; i < rows.length; i++) {
//                chartData.series.push( {label: rows[i].c[0].v, value: rows[i].c[1].v});
//            }
//            return chartData;
//        };

        var valuesThisWeek = Restangular.one('activitystats?range=weekly').get()
            .then(function (result) {
                return result;
            });

        var valuesThisMonth = Restangular.one('activitystats?range=monthly').get()
            .then(function (result) {
                return result;
            });

        var valuesThisYear = Restangular.one('activitystats?range=yearly').get()
            .then(function (result) {
                return result;
            });

        var ActivityChartService = {
            activitiesThisWeek: valuesThisWeek,
            activitiesThisMonth: valuesThisMonth,
            activitiesThisYear: valuesThisYear
        };

        return ActivityChartService;

    }])

    .controller('yp.ewl.activity.vchart.controller', ['$scope', 'yp.ewl.activity.vchart.service', function ($scope, ActivityChartService) {

        $scope.d3Options = {
//            compressed: "no",
//            chartHeight: "250",
            chartWidth: 450
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
