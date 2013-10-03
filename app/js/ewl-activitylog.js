'use strict';

angular.module('yp.activitylog', ['ui.bootstrap'])

    .factory('ActivityLogService', ['$http', '$q', function ($http, $q) {

        var ActivityLogService = {};

        var activityFieldsArray = [];

        var activityHistoryEntriesByTime = [];

        var tabs = [
            { title:"Laufende Aktivitäten", content:"partials/cockpit.activitylog.running.html" },
            { title:"Geplante Aktivitäten", content:"partials/cockpit.activitylog.planned.html" }
//            { title:"Geplante Aktivitäten", content:"partials/cockpit.activitylog.planned.html", disabled: true }
        ];

        var activityHistoryEntriesByPlanned = $http.get('js/mockdata/test-activitylog.json').then(function (result) {

            // create array structured by time
            for (var i = 0; i < result.data.length; i++) {
                if (result.data[i].activityHistory.length > 0) {

                    for (var i2 = 0; i2 < result.data[i].activityHistory.length; i2++) {

                        var activityHistoryEntryByTime = {};

                        var recurringType;

                        var comments;

                        if (result.data[i].planType === "once") {
                            recurringType = "no";
                        } else {
                            recurringType = "yes";
                        }

                        if (result.data[i].activityHistory[i2].nofComments > 0) {
                            comments = result.data[i].activityHistory[i2].comments;
                        }

                        activityHistoryEntryByTime = {
                            id: result.data[i].id,
//                            id: result.data[i].id + "-" + result.data[i].activityHistory[i2].id,
                            status: result.data[i].activityHistory[i2].status,
                            type: result.data[i].activityHistory[i2].type,
                            title: result.data[i].title,
                            nofComments: result.data[i].activityHistory[i2].nofComments,
                            recurring: recurringType,
                            planType: result.data[i].planType,
                            executionType: result.data[i].executionType,
                            visibility: result.data[i].visibility,
                            feedback: result.data[i].activityHistory[i2].feedback,
                            on: result.data[i].activityHistory[i2].on,
                            comments: comments
                        };

                        activityHistoryEntriesByTime.push(activityHistoryEntryByTime);

                    }

                }
            }
            return result.data;
        });

        var activityFields = $http.get('js/mockdata/test-activity-fields.json').then(function (result) {
            var i = 0;
            _.forEach(result.data, function (entry) {
                activityFieldsArray[i++] = entry;
            });

            return activityFieldsArray;
        });

        ActivityLogService.getActivityFieldsAsArray = function () {
            return activityFieldsArray;
        };

        ActivityLogService.getActivityFields = function () {
            return activityFields;
        };

        ActivityLogService.getActivityHistoryByPlanned = function () {
            return activityHistoryEntriesByPlanned;
        };

        ActivityLogService.getActivityHistoryByTime = function () {
            return activityHistoryEntriesByTime;
        };

        var activityLogVisible = true;

        ActivityLogService.getActivityLogVisibility = function () {
            return activityLogVisible;
        };

        ActivityLogService.getTabs = function () {
            return tabs;
        };

        return ActivityLogService;
    }
    ])

    .controller('ActivityLogVisibilityCtrl', ['$scope', 'ActivityLogService', '$filter', '$state', function ($scope, ActivityLogService, $filter, $state) {

        $scope.activityLogVisible = ActivityLogService.getActivityLogVisibility();

        $scope.getVisibilityGlyphicon = function (visibilty) {
            if (visibilty) {
                return "collapse-down";
            } else {
                return "expand";
            }
        };

        $scope.tabs = ActivityLogService.getTabs();

    }])

    .controller('ActivityLogCtrl', ['$scope', 'ActivityLogService', '$filter', '$state', function ($scope, ActivityLogService, $filter, $state) {

        $scope.activityFields = ActivityLogService.getActivityFields();

        $scope.activityFieldsArray = ActivityLogService.getActivityFieldsAsArray();

        $scope.activityHistoryEntriesByPlanned = ActivityLogService.getActivityHistoryByPlanned();
        $scope.activityHistoryEntriesByTime = ActivityLogService.getActivityHistoryByTime();

        $scope.getGlyphiconForExecutionType = function(executionType) {
            var icon = "";
            if (executionType === "self") {
                icon = "user";
            } else if (executionType === "group") {
                icon = "globe";
            } else {
                icon = "question-sign";
            }
            return icon;
        };

        $scope.getGlyphiconForVisibility = function(visibility) {
            var icon = "";
            if (visibility === "private") {
                icon = "lock";
            } else if (visibility === "campaign") {
                icon = "globe";
            } else {
                icon = "question-sign";
            }
            return icon;
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

    .controller('activityHistoryByPlannedCtrl', ['$scope', function ($scope) {

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

        $scope.openDialog = function (activityId, activityTitle, activityHistoryEntry) {
            $scope.activityID = activityId;
            $scope.activityTitle = activityTitle;
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
            return $scope.activityID + ": " + $scope.activityTitle;
        };

        $scope.getActivityWhen = function () {
            var date = new Date($scope.activityHistoryEntry.on);
            return date.toLocaleDateString() + ", " + date.toLocaleTimeString();
        };

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
