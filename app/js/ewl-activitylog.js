'use strict';

angular.module('yp.activitylog', ['ui.bootstrap', 'restangular', 'yp.ewl.activity'])

    .controller('ActivityLogCtrl', ['$scope', 'ActivityService', '$state', 'activityFields',
        function ($scope, ActivityService, $state, activityFields) {
            $scope.tabs = [
                // ToDo irig: Tab-Beschreibungen durch Config-Texte mit Translate ersetzen
                { title: "nächste", content: "partials/cockpit.activitylog.running.html" },
                { title: "vergangene", content: "partials/cockpit.activitylog.running.html" },
                { title: "Geplante Aktivitäten", content: "partials/cockpit.activitylog.planned.html" }
            ];

            $scope.activityFields = activityFields;

            // check whether we already have a plan in the current scope
            // if yes, use this one to display the events for, if not, load all from server
            if ($scope.currentActivityPlan) {
                $scope.actPlans = [$scope.currentActivityPlan];
                $scope.actEventsByTime = $scope.currentActivityPlan.getEventsByTime();
            } else {
                ActivityService.getPlannedActivities({populate: 'joiningUsers events.comments activity',
                    populatedeep: 'events.comments.author'}).then(function (plans) {
                        $scope.actPlans = plans;
                        $scope.actEventsByTime = plans.length > 0 ? plans.getEventsByTime() : [];
                    });
            }

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

            $scope.getOpenStatus = function (status) {
                if (status === "open") {
                    return "active";
                } else {
                    return "";
                }
            };

            $scope.getDoneStatus = function (status) {
                if (status === "done") {
                    return "active";
                } else {
                    return "";
                }
            };

            $scope.getMissedStatus = function (status) {
                if (status === "missed") {
                    return "active";
                } else {
                    return "";
                }
            };

            $scope.setStatus = function (status) {
                if (status === "missed") {
                    return "active";
                } else {
                    return "";
                }
            };

        }])

    // Hack, um den String "Uhr" aus den generierten Zeiten zu entfernen
    .filter('stripUhr', function () {
        return function (input) {
            return input.replace("Uhr", "");
        };
    })

    .controller('ActivityDoneModalCtrl', ['$rootScope', '$scope', '$modal', '$log', 'ActivityService', 'principal',
        function ($rootScope, $scope, $modal, $log, ActivityService, principal) {

            $scope.open = function (actEvent, activity, actPlanId) {

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

                    ActivityService.updateActivityEvent(actPlanId, actEvent).then(function (result) {
                            $log.info("ActEvent updated: " + JSON.stringify(result));
                        }, function (err) {
                            $log.info("ActEvent update failed: " + err);
                            $rootScope.$broadcast('globalUserMsg', 'Error while Saving: ' + err, 'warning', 3000);
                        }
                    );

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