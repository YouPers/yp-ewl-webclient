'use strict';

angular.module('yp.activitylog', [])

    .factory('ActivityLogService', ['$http', function ($http) {

        var ActivityLogService = {};

        var activityLogEntries = $http.get('activitylog').then(function (result) {
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

        $scope.gotoActivityDetail = function (activityLogEntry) {
            $state.go('activityDetail.'+activityLogEntry.executionType, {activityId: activityLogEntry.id});
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

        $scope.gotoActivityList = function () {
            $state.go('activitylist');
        };

        $scope.getControlGlyphicon = function (visibilty) {
            if (visibilty) {
                return "collapse-down";
            } else {
                return "expand";
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

        $scope.getControlGlyphicon = function () {
            if ($scope.selected) {
                return "collapse-down";
            } else {
                return "expand";
            }
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

    }])

    .controller('ActivityCommentCtrl', ['$scope', function ($scope) {

        // show/hide details

        $scope.toggleComments = function () {
            $scope.comments = !$scope.comments;
        };

        $scope.isComments = function () {
            return $scope.comments;
        };

    }])

    .controller('ActivityDoneCtrl', ['$scope', function ($scope) {

        // Done Dialog

        $scope.openDialog = function (activityLogEntry, activityHistoryEntry) {
            $scope.activityLogEntry = activityLogEntry;
            $scope.activityHistoryEntry = activityHistoryEntry;

            if ($scope.activityHistoryEntry.status === "done") {
                $scope.done = 1;
            } else {
                $scope.done = 2;
            }

            $scope.rating = parseInt($scope.activityHistoryEntry.feedback,10);
            $scope.newComment = "";

            $scope.doneDialogOpen = true;

        };

        $scope.hideDialog = function () {
            $scope.doneDialogOpen = false;
        };

        $scope.isDoneDialogOpen = function () {
            return $scope.doneDialogOpen;
        };

        $scope.getActivityInfo = function () {
            return $scope.activityLogEntry.id + ": " + $scope.activityLogEntry.title;
        };

        $scope.getActivityWhen = function () {
            var date = new Date($scope.activityHistoryEntry.on);
            return date.toLocaleDateString() + ", " + date.toLocaleTimeString();
        };

//        $scope.isActive = function (rating) {
//            if ($scope.rating === rating) {
//                return "active";
//            } else {
//                return "";
//            }
//        };

        $scope.storeFeedback = function (activityHistoryEntry) {

            if ($scope.done === 1) {
                activityHistoryEntry.status = "done";
            } else {
                activityHistoryEntry.status = "not done";
            }

            activityHistoryEntry.feedback = $scope.rating;

            if ($scope.newComment.length > 0) {

                var comment = {};
                comment.id = activityHistoryEntry.nofComments + 1;
                comment.text = $scope.newComment;

                // currently just UBAU

                var author = {};
                author.id = 1;
                author.fullname = "Urs Baumeler";
                author.pic = "assets/img/UBAU.jpeg";
                author.link = "#/u/UBAU";

                comment.author = author;

                activityHistoryEntry.comments.push(comment);
                activityHistoryEntry.nofComments++;

            }
            $scope.hideDialog();
        };

    }]);
