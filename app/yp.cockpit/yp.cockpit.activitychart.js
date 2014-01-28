(function () {

    'use strict';

    angular.module('yp.cockpit')

        .factory('ActivityChartService', ['Restangular', function(Restangular) {

            var valuesThisWeek = Restangular.one('activitystats').get({range: 'weekly'});

            var valuesThisMonth = Restangular.one('activitystats').get({range: 'monthly'});

            var valuesThisYear = Restangular.one('activitystats').get({range: 'yearly'});

            var ActivityChartService = {
                activitiesThisWeek: valuesThisWeek,
                activitiesThisMonth: valuesThisMonth,
                activitiesThisYear: valuesThisYear
            };

            return ActivityChartService;

        }])

        .controller('ActivityChartController', ['$scope', 'ActivityChartService', function ($scope, ActivityChartService) {

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

}());