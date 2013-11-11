'use strict';

angular.module('yp.health-management-process', ['restangular'])

    .factory('yp.health-management-process.service', ['Restangular', function(Restangular) {

        var HealthManagementProcessService = {
            statusCommit: true,
            statusAssess: false,
            statusPlan: false,
            statusDo: true,
            statusEvaluate: false,
            length: 5
        };

        return HealthManagementProcessService;

    }])

    .controller('yp.health-management-process.controller', ['$scope', 'yp.health-management-process.service', function ($scope, HealthManagementProcessService) {

        $scope.d3Options = {
//            compressed: "no",
            elementHeight: 50
//            chartWidth: 450
        };

        $scope.selectedValue = "Commit";

        $scope.processData = HealthManagementProcessService;

    }]);
