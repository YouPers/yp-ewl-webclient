'use strict';

angular.module('yp.ewl.activity.vchart', ['restangular'])

    .factory('yp.ewl.activity.vchart.service', ['Restangular', function(Restangular) {

        var valuesToday = Restangular.one('activitystats?range=today').get()
            .then(function (result) {
                return result;
            });

        var valuesThisWeek = Restangular.one('activitystats?range=thisWeek').get()
            .then(function (result) {
                return result;
            });

        var valuesCampaign = Restangular.one('activitystats?range=campaign').get()
            .then(function (result) {
                return result;
            });

        var ActivityChartService = {
            activitiesToday: valuesToday,
            activitiesThisWeek: valuesThisWeek,
            activitiesCampaign: valuesCampaign
        };

        return ActivityChartService;

    }])

    .controller('yp.ewl.activity.vchart.controller', ['$scope', 'yp.ewl.activity.vchart.service', 'activityFields', function ($scope, ActivityChartService, ActivityFields) {

        $scope.chart = {
            ActivityFields: ActivityFields
        };

        $scope.selectedValue = "today";

        $scope.getActive = function (value) {
            if (value === $scope.selectedValue) {
                return "active";
            } else {
                return "";
            }
        };

        $scope.setData = function (value) {
            $scope.selectedValue = value;
            if (value === "today") {
                $scope.chart.data = $scope.chart.dataToday;
            }
            if (value === "thisWeek") {
                $scope.chart.data = $scope.chart.dataCurrentWeek;
            }
            if (value === "campaign") {
                $scope.chart.data = $scope.chart.dataCampaign;
            }
        };

        ActivityChartService.activitiesToday.then(function (data) {
            $scope.chart.dataToday = data;
            $scope.chart.data = data; // default value
        });

        ActivityChartService.activitiesThisWeek.then(function (data) {
            $scope.chart.dataCurrentWeek = data;
        });

        ActivityChartService.activitiesCampaign.then(function (data) {
            $scope.chart.dataCampaign = data;
        });

        $scope.d3Options = {
            chartHeight: 193
        };

    }]);
