'use strict';

angular.module('yp.activitylog', []).

    factory('ActivityLogService', ['$http', function ($http) {

        var ActivityLogService = {};

        var activityLogEntries = $http.get('api/activitylog').then(function (result) {
            return result.data;
        });

        ActivityLogService.getActivityLog = function () {
            return activityLogEntries;
        };

        var activityLogVisible = true;

        ActivityLogService.getActivityLogVisibility = function () {
            return activityLogVisible;
        };

        return ActivityLogService;
    }
    ])

    .controller('ActivityLogCtrl', ['$scope', 'ActivityLogService', function ($scope, ActivityLogService) {

        $scope.activityLogEntries = ActivityLogService.getActivityLog();
        
        $scope.activityLogVisible = ActivityLogService.getActivityLogVisibility();

        $scope.toggleInstruction = function () {
            if ($scope.activityLogVisible === true) {
                return "HIDE_ACTIVITY_LOG";
            } else {
                return "SHOW_ACTIVITY_LOG";
            }
        };

        $scope.getGlyphicon = function(status) {
            var icon = "";
            if (status === "newMessage") {
                icon = "envelope";
            } else if (status === "readMessage") {
                icon = "ok";
            } else {
                icon = "star";
            }
            return icon;
        };

        $scope.getGlyphiconStatus = function(status) {
            var icon = "";
            if (status === "done") {
                icon = "ok";
            } else if (status === "not done") {
                icon = "remove";
            } else if (status === "open") {
                icon = "unchecked";
            }
            return icon;
        };

        $scope.getActionTimeType = function(status) {
            var icon = "";
            if (status === "past") {
                icon = "past";
            } else if (status === "current") {
                icon = "active";
            } else if (status === "future") {
                icon = "";
            }
            return icon;
        };
    }]);
