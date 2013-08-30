'use strict';

function ActionFieldCtrl($scope, activityService, $timeout) {

    $scope.actionFieldSelected = "";

    activityService.allActivities.then(function (data) {
        $scope.actions = data;
    });

    activityService.plannedActivities.then(function (data) {
        $scope.myPlannedActions = data;
    });

    $scope.planAction = function (action) {
        $scope.myPlannedActions.push({
            action_id: action.id,
            field: action.field
        })
    };

    $scope.dt = null;

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


    $scope.isActionPlanned = function (actionId) {
        for (var i = 0; i < $scope.myPlannedActions.length; i++) {
            if ($scope.myPlannedActions[i].action_id == actionId) {
                return true;
            }
        }
        return false;
    };


    $scope.selectActionField = function (actionField) {
        $scope.actionFieldSelected = actionField;
    };

}
