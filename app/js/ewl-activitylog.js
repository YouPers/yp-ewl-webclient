'use strict';

angular.module('yp.activitylog', ['ui.bootstrap', 'restangular', 'yp.ewl.activity'])

    .controller('ActivityLogCtrl', ['$scope', '$rootScope','ActivityService', 'activityFields', '$modal', '$log',
        function ($scope, $rootScope, ActivityService, activityFields, $modal, $log) {
            $scope.tabs = [
                // ToDo irig: Tab-Beschreibungen durch Config-Texte mit Translate ersetzen
                { title: "nächste", content: "partials/cockpit.activitylog.running.html", orderBy: "asc", filter: "nextEvents" },
                { title: "vergangene", content: "partials/cockpit.activitylog.running.html", orderBy: "des", filter: "passedEvents" },
                { title: "Geplante Aktivitäten", content: "partials/cockpit.activitylog.planned.html" }
            ];

            $scope.activityFields = activityFields;

            // check whether we already have a plan in the current scope
            // if yes, use this one to display the events for, if not, load all from server
            if ($scope.currentActivityPlan) {
                $scope.actPlans = [$scope.currentActivityPlan];
                $scope.actEventsByTime = $scope.currentActivityPlan.getEventsByTime();
            } else {
                ActivityService.getActivityPlans({populate: 'joiningUsers events.comments activity',
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
//                $scope.$state.go('activityDetail.' + activityLogEntry.executionType, {activityId: activityLogEntry.id});
                $scope.$state.go('modal_activityPlan', {activityId: activityLogEntry.id, tab: $scope.$stateParams.tab, page: $scope.currentPage});
            };

            $scope.gotoActivityList = function () {
                $scope.$state.go('activitylist');
            };

            $scope.setFilter = function (filter) {
                $scope.activityFilter = filter;
            };

            $scope.setOrderBy = function (orderBy) {
                $scope.activityOrderBy = orderBy;
            };

            $scope.getFilter = function () {
                return $scope.activityFilter;
            };

            $scope.getOrderBy = function () {
                if ($scope.activityOrderBy === "asc") {
                    return "'event.begin'";
                } else if ($scope.activityOrderBy === "des") {
                    return "'-event.begin'";
                } else {
                    return "'-event.begin'";
                }
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

            $scope.setStatus = function (actPlanId, actEvent, status) {
                actEvent.status = status;
                ActivityService.updateActivityEvent(actPlanId, actEvent).then(function (result) {
                        $log.info("ActEvent updated: " + JSON.stringify(result));
                    }, function (err) {
                        $log.info("ActEvent update failed: " + err);
                        $rootScope.$broadcast('globalUserMsg', 'Error while Saving: ' + err, 'danger', 3000);
                    }
                );
            };

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
                            author: $scope.principal.getUser()
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

    .filter('nextEvents', function () {
        return function (input) {
            var onlyPassed = [];
            for (var i = 0; i < input.length; i++) {
                if (input[i].event.status === "done" ||
                    input[i].event.status === "missed") {
                    onlyPassed.push(input[i]);
                }
            }
            return onlyPassed;
        };
    })

    .filter('filterEvents', function () {
        return function (input, filter) {
            if (!input) {
                return input;
            }
            var filteredEvents = [];
            var currentTimeStamp = new Date();
            var currentDate = new Date(
                currentTimeStamp.getFullYear(),
                currentTimeStamp.getMonth(),
                currentTimeStamp.getDate());
            if (typeof filter === 'undefined') {
                return input;
            }
            if (filter !== "passedEvents" &&
                filter !== "nextEvents") {
                return input;
            }
            for (var i = 0; i < input.length; i++) {
                var eventBeginnDate = new Date(input[i].event.begin);
                if (filter === "passedEvents" &&
                    eventBeginnDate < currentDate) {
                    filteredEvents.push(input[i]);
                } else if (filter === "nextEvents" &&
                    eventBeginnDate >= currentDate) {
                    filteredEvents.push(input[i]);

                }
            }

            return filteredEvents;
        };
    })

    // Hack, um den String "Uhr" aus den generierten Zeiten zu entfernen
    .filter('stripUhr', function () {
        return function (input) {
            return input.replace("Uhr", "");
        };
    })

    .controller('ActivityDoneModalInstanceCtrl', ['$scope', '$modalInstance', 'activity', 'actEvent',
        function ($scope, $modalInstance, activity, actEvent) {

            $scope.activity = activity;
            $scope.actEvent = actEvent;

            $scope.dialogResults = {
                done: 'done',
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