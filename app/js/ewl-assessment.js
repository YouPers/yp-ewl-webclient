'use strict';

angular.module('yp.ewl.assessment', [])

    .factory('AssessmentService', ['$http', function ($http) {
        var assService = {};

        var assessments = {};

        assService.getAssessment = function (id) {
            if (!(id in assessments)) {
                return $http.get('js/mockdata/testassessment.json').then(function (result) {
                        assessments[id] = result.data;
                        return result.data;
                    }
                );
            }
            return assessments[id];
        };

        return assService;
    }])

    .controller('AssessmentCtrl', ['$scope','AssessmentService', function ($scope, AssessmentService) {

        $scope.actionFieldSelected = "";


        // tobe loaded from server via assessmentService
        $scope.assessment = AssessmentService.getAssessment('1');
        console.log(AssessmentService.getAssessment('1'));


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

