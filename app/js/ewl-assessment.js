'use strict';

angular.module('yp.ewl.assessment', [])

    .factory('AssessmentService', ['$http', '$q', function ($http, $q) {

        // private data;
        var assessment;
        var answers = {};


        var assService = {};

        /**
         * gets Assessment from service singleton or loads it from server
         * @returns {*}
         */
        assService.getAssessment = function () {
            if (assessment) {
                return assessment;
            } else {
                return $q.all([
                        $http.get('js/mockdata/testassessment.json'),
                        $http.get('js/mockdata/testass_answers.json')
                    ]
                    ).then(function (results) {
                        assessment = results[0].data;

                        // check whether we got saved answers for this user and this assessment
                        var answersAsArray;
                        if (results[1].data.size > 0) {
                            answersAsArray = results[1].data;
                        } else {
                            // got no answers from server, need to generate default answers
                            answersAsArray = generateDefaultAnswers();
                        }

                        // sort answers into keyed object (by question_id) to ease access by view
                        _.forEach(answersAsArray, function (myAnswer) {
                            answers[myAnswer.question_id] = myAnswer;
                        });
                        return assessment;
                    }
                );
            }
        };

        assService.getAssAnswers = function () {
            return answers;
        };


        /**
         * generate empty answerset for the currently loaded assessment, is called in case
         * we did not get stored answers for this assessment/user from the server
         *
         * @returns {Array}
         */
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
                        answer: 0,
                        answered: false
                    };
                    defaultAnswers.push(answer);
                }
            }
            return defaultAnswers;

        }

        return assService;
    }])

    .controller('AssessmentCtrl', ['$scope', 'AssessmentService','$state', function ($scope, AssessmentService, $state) {

        $scope.assessment = AssessmentService.getAssessment();
        $scope.assAnswersByQuestionId = AssessmentService.getAssAnswers();

        $scope.answersAsJSON = function () {
            return JSON.stringify(AssessmentService.getAssAnswers(), undefined, 2);
        };

        $scope.assessmentDone = function () {
            $state.go('cockpit');
        };

        $scope.setQuestionAnswered = function (questionid) {
            if (!($scope.assAnswersByQuestionId[questionid].answered)) {
                $scope.assAnswersByQuestionId[questionid].answered = true;
            }
        }

    }]);