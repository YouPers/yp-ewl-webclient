'use strict';

angular.module('yp.ewl.assessment', [])

    .factory('AssessmentService', ['$http', '$q', function ($http, $q) {
        var assService = {};

        var assessment;
        var answers = {};

        assService.getAssessment = function (id) {
            return $q.all([
                    $http.get('js/mockdata/testassessment.json'),
                    $http.get('js/mockdata/testass_answers.json')
                ]
                ).then(function (results) {
                    assessment = results[0].data;
                    var answersAsArray;

                    if (results[1].data.size > 0) {
                        answersAsArray = results[1].data;
                    } else {
                        answersAsArray = generateDefaultAnswers();
                    }

                    _.forEach(answersAsArray, function (myAnswer) {
                        answers[myAnswer.question_id] = myAnswer
                    });
                    return assessment;
                }
            );
        }

        assService.getAssAnswers = function () {
            return answers;
        }


        function generateDefaultAnswers() {
            var defaultAnswers = [];
            var nextId = 1;
            for (var i = 0; i < assessment.questionCats.length; i++) {
                var questionCat = assessment.questionCats[i];
                for (var j = 0; j < questionCat.questions.length; j++) {
                    var question = questionCat.questions[j];
                    var answer = {
                        id: nextId++,
                        assessment_id: assessment.id,
                        question_id: question.id,
                        answer: 0
                    }
                    defaultAnswers.push(answer);
                }
            }
            return defaultAnswers;

        }

        return assService;
    }])

    .controller('AssessmentCtrl', ['$scope', 'AssessmentService', function ($scope, AssessmentService) {
        var assId = '1';  // only one assessment suppoerted at the moment

        $scope.assessment = AssessmentService.getAssessment(assId);
        $scope.assAnswersByQuestionId = AssessmentService.getAssAnswers();

    }]);

