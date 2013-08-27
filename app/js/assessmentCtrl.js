'use strict';

function AssessmentCtrl($scope) {

    $scope.actionFieldSelected = "";

    $scope.assessment = {
        name: "ASSESS_YOUR_STRESS_LEVEL",
        questionCats: [
            {
                categorie: "GENERAL_STRESSLEVEL",
                questions: [
                    {
                        id: 1,
                        title: "HOW_PERCEIVE_CURRENT_LEVEL",
                        minText: "I_AM_UNDER_CHALLENGED",
                        maxText: "I_AM_OVERLOADED",
                        expText: "explainText1",
                        answer: 0
                    }
                ]
            }
            ,
            {
                categorie: "AT_WORK",
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
