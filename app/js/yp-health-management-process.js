'use strict';

angular.module('yp.health-management-process', ['restangular'])

    .factory('yp.health-management-process.service', ['Restangular', function(Restangular) {

        var HealthManagementProcessService = {
            statusCommit: true,
            statusAssess: false,
            statusPlan: true,
            statusDo: false,
            statusEvaluate: false
        };

        return HealthManagementProcessService;

    }])

    .controller('yp.health-management-process.controller', ['$scope', 'yp.health-management-process.service', function ($scope, HealthManagementProcessService) {

        $scope.d3OptionsCommit = {
            displayType: "commit"
        };

        $scope.d3OptionsAssess = {
            displayType: "assess"
        };

        $scope.d3OptionsPlan = {
            displayType: "plan"
        };

        $scope.d3OptionsDo = {
            displayType: "do"
        };

        $scope.d3OptionsEvaluate = {
            displayType: "evaluate"
        };

        $scope.processData = HealthManagementProcessService;

    }]);
