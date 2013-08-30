'use strict';

angular.module('yp.ewl.assessment', [])
    .factory('AssessmentService', ['$http', function ($http) {
        var assService = {};

        assService.getAssessment = function (id) {
            $http.get();
        };

        return assService;
    }])

    .controller('AssessmentCtrl', ['$scope', function ($scope) {

        $scope.actionFieldSelected = "";

        // tobe loaded from server via assessmentService
        $scope.assessment = {
            id: "1",
            name: "ASSESS_YOUR_STRESS_LEVEL",
            questionCats: [
                {
                    id: "1",
                    categorie: "GENERAL_STRESSLEVEL",
                    questions: [
                        {
                            id: 1,
                            title: "HOW_PERCEIVE_CURRENT_LEVEL",
                            minText: "I_AM_UNDER_CHALLENGED",
                            maxText: "I_AM_OVERLOADED",
                            expText: "explainText1",
                            defaultAnswer: 0
                        }
                    ]
                }
                ,
                {
                    id: "2",
                    categorie: "AT_WORK",
                    questions: [
                        {
                            id: 2,
                            title: "question2",
                            minText: "minText2",
                            maxText: "maxText2",
                            expText: "explainText2",
                            defaultAnswer: 0
                        },
                        {
                            id: 3,
                            title: "question3",
                            minText: "minText3",
                            maxText: "maxText3",
                            expText: "explainText3",
                            defaultAnswer: 0
                        },
                        {
                            id: 4,
                            title: "question4",
                            minText: "minText4",
                            maxText: "maxText4",
                            expText: "explainText4",
                            defaultAnswer: 0
                        }
                    ]
                }
            ]
        };

        // tobe loaded from server via assessmentService
        var assessmentAnswers = [
            {
                id: 1,
                assessment_id: 1,
                question_id: 1,
                answer: 0
            },
            {
                id: 2,
                assessment_id: 1,
                question_id: 2,
                answer: 0
            }
            ,
            {
                id: 3,
                assessment_id: 1,
                question_id: 3,
                answer: 0
            }
            ,
            {
                id: 4,
                assessment_id: 1,
                question_id: 4,
                answer: 0
            }
            ,
            {
                id: 5,
                assessment_id: 1,
                question_id: 5,
                answer: 0
            }

        ];

        $scope.assAnswersByQuestionId = getAnswersByQuestionId(assessmentAnswers);

        function getAnswersByQuestionId(assessmentAnswers) {
            var answersByQId = {};
            _.forEach(assessmentAnswers, function (myAnswer) {
                answersByQId[myAnswer.question_id] = myAnswer
            });
            return answersByQId;

        }


        $scope.planAction = function (action) {
            $scope.myPlannedActions.push({
                action_id: action.id,
                field: action.field
            })
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
        }
    }]);

