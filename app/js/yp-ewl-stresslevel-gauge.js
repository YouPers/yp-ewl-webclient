'use strict';

angular.module('yp.ewl.stresslevel.gauge', [])

    .factory('yp.ewl.stresslevel.gauge.service', ['$http', function($http) {

        var stressLevels = [
            {
                label: "Allgemein",
                level: 6
            },
            {
                label: "Arbeit",
                level: 2
            },
            {
                label: "Freizeit",
                level: 4
            },
            {
                label: "Typ",
                level: 8
            },
            {
                label: "Ausgleich",
                level: 10
            }
        ];

        var StressLevelGaugeService = {
            stressLevelGeneral: stressLevels[0],
            stressLevelWorkPlace: stressLevels[1],
            stressLevelTimeOff: stressLevels[2],
            stressLevelType: stressLevels[3],
            stressLevelMastery: stressLevels[4]
        };

        return StressLevelGaugeService;

    }])

    .controller('yp.ewl.stresslevel.gauge.controller', ['$scope', 'yp.ewl.stresslevel.gauge.service', function ($scope, StressLevelGaugeService) {

        $scope.d3Options = {
            size: 100
        };

        $scope.gauge = {};

        $scope.stressLevelGeneral = StressLevelGaugeService.stressLevelGeneral;
        $scope.stressLevelWorkPlace = StressLevelGaugeService.stressLevelWorkPlace;
        $scope.stressLevelTimeOff = StressLevelGaugeService.stressLevelTimeOff;
        $scope.stressLevelType = StressLevelGaugeService.stressLevelType;
        $scope.stressLevelMastery = StressLevelGaugeService.stressLevelMastery;

    }]);
