'use strict';

function ActionFieldCtrl($scope, activityService, $timeout) {

    $scope.actionFieldSelected = "";

    activityService.allActivities.then(function(data) {
        $scope.actions = data;
    });

    activityService.plannedActivities.then(function(data) {
        $scope.myPlannedActions = data;
    });

    $scope.planAction = function (action) {
      $scope.myPlannedActions.push({
          action_id: action.id,
          field: action.field
      })
    }

    $scope.dt = new Date();

    $scope.today = function() {
        $scope.dt = new Date();
    };
    $scope.today();

    $scope.showWeeks = true;
    $scope.toggleWeeks = function () {
        $scope.showWeeks = ! $scope.showWeeks;
    };

    $scope.clear = function () {
        $scope.dt = null;
    };

    // Disable weekend selection
    $scope.disabled = function(date, mode) {
        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };

    $scope.toggleMin = function() {
        $scope.minDate = ( $scope.minDate ) ? null : new Date();
    };
    $scope.toggleMin();

    $scope.open = function() {
        $timeout(function() {
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
    }


    $scope.selectActionField = function (actionField) {
        $scope.actionFieldSelected = actionField;
    };

}
