/**
 * Created with IntelliJ IDEA.
 * User: IvanRigamonti
 * Date: 19.07.13
 * Time: 15:06
 * example from http://angularjs.org/
 */

function ActionFieldCtrl($scope, activityService) {

    $scope.actionFieldSelected = "";

    $scope.actions = activityService.allActivities();

    $scope.myPlannedActions = [
        {
            action_id: 2,
            field: "exercise"
        },
        {
            action_id: 3,
            field: "exercise"
        }

    ];

    $scope.planAction = function (action) {
      $scope.myPlannedActions.push({
          action_id: action.id,
          field: action.field
      })
    }

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
