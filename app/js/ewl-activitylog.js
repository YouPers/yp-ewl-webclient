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

    .factory('ActivityLogService2', ['$http', '$q', function ($http, $q) {

        var ActivityLogService2 = {};

        var activityFieldsArray = [];

        var activityLogEntries = $http.get('js/mockdata/test-activitylog.json').then(function (result) {
            return result.data;
        });

        var activityFields = $http.get('js/mockdata/test-activity-fields.json').then(function (result) {
            var i = 0;
            _.forEach(result.data, function (entry) {
                activityFieldsArray[i++] = entry;
            });

            return activityFieldsArray;
        });

        ActivityLogService2.getActivityFieldsAsArray = function () {
            return activityFieldsArray;
        };

        ActivityLogService2.getActivityFields = function () {
            return activityFields;
        };

        ActivityLogService2.getActivityLog = function () {
            return activityLogEntries;
        };

        var activityLogVisible = true;

        ActivityLogService2.getActivityLogVisibility = function () {
            return activityLogVisible;
        };

        return ActivityLogService2;
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
    }])

    .controller('ActivityLogCtrl2', ['$scope', 'ActivityLogService2', '$filter', '$state', function ($scope, ActivityLogService2, $filter, $state) {

        $scope.activityFields = ActivityLogService2.getActivityFields();

        $scope.activityFieldsArray = ActivityLogService2.getActivityFieldsAsArray();

        $scope.activityLogEntries = ActivityLogService2.getActivityLog();

        $scope.activityLogVisible = ActivityLogService2.getActivityLogVisibility();

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

        $scope.gotoActivityDetail = function (activityId) {
            $state.go('actionDetail', {actionId: activityId});
        };

        $scope.getActivityFieldName = function(activityFieldId) {
            var activityField = _.find($scope.activityFieldsArray, function(obj) {
                return obj.id === activityFieldId;
            });
            if (activityField) {
                return activityField.beschreibungdt;
            } else {
                return undefined;
            }
        };

    }])

    .controller('ActivityLogHistoryCtrl', ['$scope', function ($scope) {

        $scope.toggleSelected = function () {
            $scope.selected = !$scope.selected;
        };

        $scope.isSelected = function () {
            return $scope.selected;
        };

        $scope.getActivityTimeType = function(status) {
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

    }]);
