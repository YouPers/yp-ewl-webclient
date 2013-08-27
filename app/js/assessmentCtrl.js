/**
 * Created with IntelliJ IDEA.
 * User: IvanRigamonti
 * Date: 19.07.13
 * Time: 15:06
 * example from http://angularjs.org/
 */

function AssessmentCtrl($scope) {

    $scope.actionFieldSelected = "";

    $scope.assessment = {
        name: "Beurteile deinen Stresslevel",
        questionCats: [
            {
                categorie: "Allgemeiner Stresslevel",
                questions: [
                    {
                        id: 1,
                        title: "Wie beurteilst du deinen Stresslevel jetzt in diesem Moment?",
                        minText: "Ich bin unterfordert, mir ist langweilig",
                        maxText: "Ich bin total gestresst",
                        expText: "explainText1",
                        answer: 0
                    }
                ]
            }
            ,
            {
                categorie: "Am Arbeitsplatz:",
                questions: [
                    {
                        id: 2,
                        title: "question2",
                        minText: "minText2",
                        maxText: "maxText2",
                        expText: "explainText2",
                        answer: 0
                    },
                    {
                        id: 3,
                        title: "question3",
                        minText: "minText3",
                        maxText: "maxText3",
                        expText: "explainText3",
                        answer: 0
                    },
                    {
                        id: 4,
                        title: "question4",
                        minText: "minText4",
                        maxText: "maxText4",
                        expText: "explainText4",
                        answer: 0
                    }
                ]
            }
        ]
    }


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
    }

}
