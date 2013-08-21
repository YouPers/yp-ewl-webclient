/**
 * Created with IntelliJ IDEA.
 * User: IvanRigamonti
 * Date: 19.07.13
 * Time: 15:06
 * example from http://angularjs.org/
 */

function ActionFieldCtrl($scope) {

    $scope.actionFieldSelected = "";

    $scope.actions = [
        {
            id: 1,
            title: "Iss täglich einen Apfel",
            text: "Früchte sind superduper und darum sollte man immer eine essen...",
            field: "nutrition",
            planningCat: "daily"
        },
        {
            id: 2,
            title: "Joggen über Mittag",
            text: "Run forest, Run...",
            field: "exercise",
            planningCat: "daily"
        },
        {
            id: 3,
            title: "Badminton über Mittag",
            text: "Sport zu zweit verhilft zu mehr Bewegung und gibt Gelegenheit sich in ungezwungener Atmosphäre mit einem Kollegen zu unterhalten.",
            field: "exercise",
            planningCat: "daily"
        },
        {
            id: 4,
            title: "Spaziergang über Mittag",
            text: "ist immer super",
            field: "exercise",
            planningCat: "daily"
        },
        {
            id: 5,
            title: "Einmal pro Woche das Light-Menu in der Kantine essen.",
            text: "nicht immer Pommes essen!",
            field: "nutrition",
            planningCat: "weekly"
        },
        {
            id: 6,
            title: "Iss täglich eine Birne",
            text: "wenn der Apfel mal verleidet ist",
            field: "nutrition",
            planningCat: "daily"
        },
        {
            id: 7,
            title: "Iss täglich eine Mandarine",
            text: "why not a mandarine...",
            field: "nutrition",
            planningCat: "daily"
        }
    ];


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
