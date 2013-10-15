'use strict';

angular.module('yp.ewl.status', ['googlechart'])

    .factory('yp.ewl.status.service', ['$http', function($http) {

        var valuesStressLevel = $http.get('stressLevelStatus')
            .then(function (result) {
                return result.data;
            });

        var StatusService = {
            StressLevelValues: valuesStressLevel
        };

        return StatusService;

    }])

    .controller('yp.ewl.status.controller', ['$scope', 'yp.ewl.status.service', function ($scope, StatusService) {

        $scope.chart = {};

        StatusService.StressLevelValues.then(function (data) {
            $scope.chart.data = data; // default value
        });

        $scope.chart.type = "Gauge";
//        $scope.chart.displayed = false;
        $scope.chart.cssStyle = "height:150px; width:100%;";

        $scope.chart.options = {
            "animation.duration": 700,
            "animation.easing": 'inAndOut',
            "redColor": '#FF9900',
            "greenFrom": 2.5,
            "greenTo": 3.5,
            "yellowFrom": 1,
            "yellowTo": 2.5,
            "redFrom": 3.5,
            "redTo": 5,
            "fill": 20,
            "min": 1,
            "max": 5,
            "minorTicks": 2
//            ,
//            "vAxis": {
//                "title": "Anzahl Aktivitäten",
//                "gridlines": {"count": 5},
//                "titleTextStyle": {italic: false}
//            },
//            "hAxis": {
//                "title": "Bereiche",
//                "titleTextStyle": {italic: false},
//                "slantedText": true
//            }
        };

    }]);
