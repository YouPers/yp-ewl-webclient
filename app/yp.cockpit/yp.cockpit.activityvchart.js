'use strict';

angular.module('yp.cockpit')


    .controller('ActivityVChartController', ['$scope', 'activityFields', 'chart', function ($scope, ActivityFields, chart) {

        $scope.chart = chart;
        $scope.chart = _.extend($scope.chart,{
            ActivityFields: ActivityFields
        });

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
            $scope.chart.data = $scope.chart[value];
        };

        $scope.setData($scope.selectedValue);

        $scope.d3Options = {
            chartHeight: 193
        };

    }])
    .factory('ActivityChartService', ['Restangular', '$q', function(Restangular, $q) {

        var getActivityStatsByRange = function(range) {
            return Restangular.one('activitystats?range=' + range).get();
        };


        var ActivityChartService = {

            getActivityStats: function () {

                var chart = $q.all([
                        getActivityStatsByRange('today'),
                        getActivityStatsByRange('thisWeek'),
                        getActivityStatsByRange('campaign')
                    ]).then(function(r) {
                        return {
                            today: r[0],
                            thisWeek: r[1],
                            campaign: r[2]
                        };
                    });

                return chart;
            }
        };

        return ActivityChartService;

    }]);
