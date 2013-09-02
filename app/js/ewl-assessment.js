'use strict';

angular.module('yp.ewl.assessment', [])

    .factory('AssessmentService', ['$http', function ($http) {
        var assService = {};

        var assessments = {};

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
            },
            {
                id: 6,
                assessment_id: 1,
                question_id: 6,
                answer: 0
            },
            {
                id: 7,
                assessment_id: 1,
                question_id: 7,
                answer: 0
            }
            ,
            {
                id: 8,
                assessment_id: 1,
                question_id: 8,
                answer: 0
            }
            ,
            {
                id: 9,
                assessment_id: 1,
                question_id: 9,
                answer: 0
            }
            ,
            {
                id: 10,
                assessment_id: 1,
                question_id: 10,
                answer: 0
            },
            {
                id: 11,
                assessment_id: 1,
                question_id: 11,
                answer: 0
            },
            {
                id: 12,
                assessment_id: 1,
                question_id: 12,
                answer: 0
            }
            ,
            {
                id: 13,
                assessment_id: 1,
                question_id: 13,
                answer: 0
            }
            ,
            {
                id: 14,
                assessment_id: 1,
                question_id: 14,
                answer: 0
            }
            ,
            {
                id: 15,
                assessment_id: 1,
                question_id: 15,
                answer: 0
            },
            {
                id: 16,
                assessment_id: 1,
                question_id: 16,
                answer: 0
            },
            {
                id: 17,
                assessment_id: 1,
                question_id: 17,
                answer: 0
            }
            ,
            {
                id: 18,
                assessment_id: 1,
                question_id: 18,
                answer: 0
            }
            ,
            {
                id: 19,
                assessment_id: 1,
                question_id: 19,
                answer: 0
            }
            ,
            {
                id: 20,
                assessment_id: 1,
                question_id: 20,
                answer: 0
            }

        ];

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

        assService.getAssAnswers = function (ass_id) {
            if (ass_id == 1) {
                return assessmentAnswers;
            } else {
                // unknown assessment.
                return null;
            }

        }

        return assService;
    }])

    .controller('AssessmentCtrl', ['$scope', 'AssessmentService', function ($scope, AssessmentService) {
        var assId = '1';  // only one assessment suppoerted at the moment

        // tobe loaded from server via assessmentService
        $scope.assessment = AssessmentService.getAssessment(assId);


        $scope.assAnswersByQuestionId = getAnswersByQuestionId(AssessmentService.getAssAnswers(assId));

        function getAnswersByQuestionId(assessmentAnswers) {
            var answersByQId = {};
            _.forEach(assessmentAnswers, function (myAnswer) {
                answersByQId[myAnswer.question_id] = myAnswer
            });
            return answersByQId;

        }
  }]);

