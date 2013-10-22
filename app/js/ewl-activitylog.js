'use strict';

angular.module('yp.activitylog', ['ui.bootstrap', 'restangular', 'yp.ewl.activity'])

    .factory('ActivityLogService', ['Restangular', '$q', function (Restangular, $q) {

        var ActivityLogService = {};

        var actEventsByTime = [];

        var actPlans = [];

        var tabs = [
            // ToDo irig: Tab-Beschreibungen durch Config-Texte mit Translate ersetzen
            { title: "nach Datum", content: "partials/cockpit.activitylog.running.html" },
            { title: "Geplante Aktivitäten", content: "partials/cockpit.activitylog.planned.html" }
        ];

        var activitiesPlannedBase = Restangular.all('activitiesPlanned');
        actPlans = activitiesPlannedBase.getList({populate: 'joiningUsers events.comments activity', populatedeep: 'events.comments.author'})
            .then(function (actPlanList) {
                // create array structured by time
                for (var i = 0; i < actPlanList.length; i++) {
                    for (var i2 = 0; i2 < actPlanList[i].events.length; i2++) {
                        actEventsByTime.push({
                            event: actPlanList[i].events[i2],
                            plan: actPlanList[i],
                            activity: actPlanList[i].activity
                        });
                    }
                }
                return actPlanList;
            });

        ActivityLogService.getActPlans = function () {
            return actPlans;
        };

        ActivityLogService.getActivityHistoryByTime = function () {
            return actEventsByTime;
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

    .controller('ActivityLogCtrl', ['$scope', 'ActivityLogService', '$filter', '$state', 'activityFields',
        function ($scope, ActivityLogService, $filter, $state, activityFields) {

            $scope.activityFields = activityFields;

            ActivityLogService.getActPlans().then(function (plans) {
                $scope.actPlans = plans;
            });

            $scope.actEventsByTime = ActivityLogService.getActivityHistoryByTime();

            $scope.getGlyphiconForExecutionType = function (executionType) {
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

            $scope.getGlyphiconForVisibility = function (visibility) {
                var icon = "";
                if (visibility === "private") {
                    icon = "lock";
                } else if (visibility === "campaign") {
                    icon = "globe";
                } else {
                    // default is "private"
                    icon = "lock";
                }
                return icon;
            };

            $scope.gotoActivityDetail = function (activityLogEntry) {
                $state.go('activityDetail.' + activityLogEntry.executionType, {activityId: activityLogEntry.id});
            };

            $scope.getActivityFieldName = function (activityFieldId) {
                var activityField = _.find($scope.activityFields, function (obj) {
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

            $scope.getActivityTimeType = function (status) {
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

            $scope.getGlyphiconStatus = function (status) {
                var icon = "";
                if (status === "done") {
                    icon = "ok";
                } else if (status === "missed") {
                    icon = "remove";
                } else if (status === "open") {
                    icon = "unchecked";
                }
                return icon;
            };

        }])

    .controller('ActivityDoneModalCtrl', ['$scope', '$modal', '$log', 'ActivityLogService', 'principal',
        function ($scope, $modal, $log, ActivityLogService, principal) {

            $scope.open = function (actEvent, activity) {

                var modalInstance = $modal.open({
                    templateUrl: "partials/cockpit.activity.done.html",
                    controller: "ActivityDoneModalInstanceCtrl",
                    backdrop: true,
                    resolve: {
                        activity: function () {
                            return activity;
                        },
                        actEvent: function () {
                            return actEvent;
                        }
                    }
                });

                modalInstance.result.then(function (returnedValue) {

                    actEvent.status = returnedValue.done;
                    actEvent.feedback = returnedValue.feedback;

                    if (returnedValue.doneText.length > 0) {
                        var comment = {
                            text: returnedValue.doneText,
                            created: new Date().toISOString(),
                            author: principal.getUser()
                        };
                        actEvent.comments.push(comment);
                    }

                    // ActivityLogService.updateActivity($scope.activity.id, actEventByTime.event);

                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            };
        }])

    .controller('ActivityDoneModalInstanceCtrl', ['$scope', '$modalInstance', 'activity', 'actEvent',
        function ($scope, $modalInstance, activity, actEvent) {

            $scope.activity = activity;
            $scope.actEvent = actEvent;

            $scope.dialogResults = {
                done: actEvent.status,
                doneText: "",
                feedback: actEvent.feedback
            };

            $scope.ok = function () {
                $modalInstance.close($scope.dialogResults);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };

        }]);
