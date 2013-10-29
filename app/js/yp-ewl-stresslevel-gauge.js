'use strict';

angular.module('yp.ewl.stresslevel.gauge', [])

    .factory('yp.ewl.stresslevel.gauge.service', [function() {

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

    .controller('yp.ewl.stresslevel.gauge.controller', ['$scope', '$timeout', 'yp.ewl.stresslevel.gauge.service', function ($scope, $timeout, StressLevelGaugeService) {

        $scope.d3Options = {
            size: 100
        };

        $scope.gauge = {};

//        var stressLevelGeneralO = StressLevelGaugeService.stressLevelGeneral.level;
//        var stressLevelWorkPlaceO = StressLevelGaugeService.stressLevelWorkPlace.level;
//        var stressLevelTimeOffO = StressLevelGaugeService.stressLevelTimeOff.level;
//        var stressLevelTypeO = StressLevelGaugeService.stressLevelType.level;
//        var stressLevelMasteryO = StressLevelGaugeService.stressLevelMastery.level;

        $scope.stressLevelGeneral = StressLevelGaugeService.stressLevelGeneral;
        $scope.stressLevelWorkPlace = StressLevelGaugeService.stressLevelWorkPlace;
        $scope.stressLevelTimeOff = StressLevelGaugeService.stressLevelTimeOff;
        $scope.stressLevelType = StressLevelGaugeService.stressLevelType;
        $scope.stressLevelMastery = StressLevelGaugeService.stressLevelMastery;

        $scope.variance = false;

//        var updateGauge = function (gauge, gaugeOrig) {
//            if (gauge.level < (gaugeOrig - 0.1)) {
//                $scope.variance = true;
//            }
//            if (gauge.level > (gaugeOrig + 0.1)) {
//                $scope.variance = false;
//            }
//            if ($scope.variance) {
//                gauge.level = gauge.level + 0.05;
//            } else {
//                gauge.level = gauge.level - 0.05;
//            }
//
//        };
//
//        $timeout(function someWork () {
//            updateGauge($scope.stressLevelGeneral, stressLevelGeneralO);
//            updateGauge($scope.stressLevelWorkPlace, stressLevelWorkPlaceO);
//            updateGauge($scope.stressLevelTimeOff, stressLevelTimeOffO);
//            updateGauge($scope.stressLevelType, stressLevelTypeO);
//            updateGauge($scope.stressLevelMastery, stressLevelMasteryO);
//            $timeout(someWork, 200);
//        }, 200);


//        setInterval(updateGauge($scope.stressLevelGeneral, $scope.stressLevelGeneralO), 500);

    }]);
