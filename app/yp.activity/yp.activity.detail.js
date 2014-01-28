(function () {
    'use strict';


    angular.module('yp.activity')

        .controller('ActivityDetailCtrl', ['$scope', 'ActivityService', '$timeout', 'activity', 'plan',
            '$rootScope', '$sce', 'actPlansToJoin',
            function ($scope, ActivityService, $timeout, activity, plan, $rootScope, $sce, actPlansToJoin) {

                $scope.currentActivity = activity;
                // using a model.xxxx to have writable access to this porperty in child scopes (e.g. in the two tabs)
                $scope.model = {
                    currentExecutionType:  actPlansToJoin.length > 0 ? 'group' : 'self'
                };

                $scope.actPlansToJoin = actPlansToJoin;

                if (plan) {
                    $scope.currentActivityPlan = plan;
                } else {
                    $scope.currentActivityPlan = $scope.currentActivity.getDefaultPlan();
                }


                // one time planning using daypicker
                $scope.showWeeks = false;
                $scope.minDate = new Date();

                $scope.open = function () {
                    $timeout(function () {
                        $scope.opened = true;
                    });
                };
                $scope.dateOptions = {
                    'year-format': "'yy'",
                    'starting-day': 1
                };

                // weekplanning using dayselector
                $scope.availableDays = [
                    {label: 'MONDAY', value: "1"},
                    {label: 'TUESDAY', value: "2"},
                    {label: 'WEDNESDAY', value: "3"},
                    {label: 'THURSDAY', value: "4"},
                    {label: 'FRIDAY', value: "5"},
                    {label: 'SATURDAY', value: "6"},
                    {label: 'SUNDAY', value: "0"}
                ];

                function nextWeekday(date, weekday) {
                    if (!weekday) {
                        return date;
                    }
                    var input = moment(date);
                    var output = input.day(weekday);
                    return output > moment(date) ? output.toDate() : output.add('week', 1).toDate();
                }


                $scope.$watch('currentActivityPlan.weeklyDay', function (newValue, oldValue) {
                    if (newValue && $scope.currentActivityPlan.mainEvent.frequency === 'week') {
                        var duration = $scope.currentActivityPlan.mainEvent.end - $scope.currentActivityPlan.mainEvent.start;
                        $scope.currentActivityPlan.mainEvent.start = nextWeekday(new Date(), newValue);
                        $scope.currentActivityPlan.mainEvent.end = moment($scope.currentActivityPlan.mainEvent.start).add(duration);
                    }
                });

                $scope.getRenderedText = function (activity) {
                    if (activity.text) {
                        return $sce.trustAsHtml(markdown.toHTML(activity.text));
                    } else {
                        return "";
                    }
                };

                $scope.joinPlan = function (planToJoin) {
                    var slavePlan = _.clone(planToJoin);
                    delete slavePlan.id;
                    slavePlan.joiningUsers = [];
                    slavePlan.owner = $scope.principal.getUser().id;
                    slavePlan.masterPlan = planToJoin.id;
                    ActivityService.savePlan(slavePlan).then(function (slavePlanReloaded) {
                            $rootScope.$broadcast('globalUserMsg', 'Successfully joined the group activity', 'success', '5000');

                            // The post call returns the updated activityPlan, but does not populate the activity property,
                            // no problem, we already have the activity in the session
                            slavePlanReloaded.activity = $scope.currentActivity;
                            $scope.currentActivityPlan = slavePlanReloaded;
                        },
                        function (err) {
                            $rootScope.$broadcast('globalUserMsg', 'Unable to join group activity: ' + err, 'danger', '5000');

                        });
                };

                $scope.inviteEmailToJoinPlan = function (email, activityPlan) {
                    $scope.model.inviteEmail = "";

                    $scope.$broadcast('formPristine');
                    ActivityService.inviteEmailToJoinPlan(email, activityPlan).then(
                        function success (result) {
                            $rootScope.$broadcast('globalUserMsg', email +' erfolgreich eingeladen!', 'success', 5000);
                        },
                        function error (err) {
                            $rootScope.$broadcast('globalUserMsg', 'Einladung konnte nicht versendet werden: '+ err.status, 'danger', 5000);
                        }
                    );
                };

                $scope.isActivityPlanned = function () {
                    return $scope.currentActivityPlan.id;
                };

                $scope.planActivityCancel = function () {
                    if ($scope.$modalInstance) {
                        $scope.$modalInstance.dismiss();
                    } else {
                        $scope.$state.go('activitylist', $rootScope.$stateParams);
                    }
                };

                $scope.planActivityDone = function () {
                    ActivityService.savePlan($scope.currentActivityPlan).then(function (result) {
                        $rootScope.$broadcast('globalUserMsg', 'Aktivität erfolgreich eingeplant', 'success', '5000');
                        if ($scope.$modalInstance) {
                            $scope.$modalInstance.dismiss();
                        } else {
                            $scope.$state.go('activitylist', $rootScope.$stateParams);
                        }
                    }, function (err) {
                        console.log(JSON.stringify(err));
                        $rootScope.$broadcast('globalUserMsg', 'Aktivität nicht gespeichert, Code: ' + err, 'danger', '5000');
                    });
                };
            }]);

}());