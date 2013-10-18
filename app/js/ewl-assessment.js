'use strict';

angular.module('yp.ewl.assessment', ['ui.router', 'yp.auth', 'restangular'])

    // configuration of routes for all assessment module pages
    .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
        function ($stateProvider, $urlRouterProvider, accessLevels) {
            $stateProvider
                .state('assessment', {
                    url: "/assessment/:assessmentId",
                    templateUrl: "partials/assessment.html",
                    controller: "AssessmentCtrl",
                    access: accessLevels.all,
                    resolve: {
                        assessmentData: ['AssessmentService', '$stateParams',
                            function (AssessmentService, $stateParams) {
                                return AssessmentService.getAssessmentData($stateParams.assessmentId);
                            }]
                    }
                });
        }])

    // Object methods for all Assessment related objects
    .run(['Restangular', function (Restangular) {
        Restangular.extendModel('assessments', function (assessment) {

            assessment.getDefaultAnswers = function () {
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

            };
            return assessment;
        });
    }])

    // provides methods to get Assessment Information from the server
    .factory('AssessmentService', ['$http', '$q', 'Restangular', 'principal', function ($http, $q, Restangular, principal) {

        var assService = {
            getAssessmentData: function (assessmentId) {
                var assessmentBase = Restangular.one('assessments', assessmentId);

                // if the user is authenticated we try to get his previous answers from the server,
                // if unauthenticated, we only get the assessment
                var neededCalls = [assessmentBase.get()];
                if (principal.isAuthenticated()) {
                    neededCalls.push(
                        assessmentBase.one('results/newest').get()
                        //Restangular.one('users', principal.getUser().username).one('assessmentresults', assessmentId).get()
                    );
                }
                // run the one/two calls in parallel and then processes the results
                return $q.all(neededCalls).then(function (results) {
                    var assessment = results[0];

                    // check whether we got saved answers for this user and this assessment
                    var answersAsArray;
                    if (results[1] && (results[1]) && (results[1].size > 0)) {
                        answersAsArray = results[1];
                    } else {
                        // got no answers from server, need to generate default answers
                        answersAsArray = assessment.getDefaultAnswers();
                    }

                    // sort answers into keyed object (by question_id) to ease access by view
                    var answers = {};
                    _.forEach(answersAsArray, function (myAnswer) {
                        answers[myAnswer.question_id] = myAnswer;
                    });

                    // return both, assessment and answers in an simple object
                    return {
                        assessment: assessment,
                        answers: answers
                    };
                });


            }
        };

        return assService;
    }])

    // Controller to display an assessment and process the answers
    // assessmentData is resolved on stateTransfer
    .controller('AssessmentCtrl', ['$scope', '$rootScope', '$state', 'assessmentData',
        function ($scope, $rootScope, $state, assessmentData) {

            $scope.assessment = assessmentData.assessment;
            $scope.assAnswersByQuestionId = assessmentData.answers;

            $scope.assessmentDone = function () {
                if (!$scope.principal.isAuthenticated()) {
                    $rootScope.$broadcast('loginMessageShow');
                } else {
                    assessmentData.answers.timestamp = new Date();
                    // Todo (rblu): save assessmentAnswers
                    //
                    $state.go('cockpit');

                }
            };

            $scope.setQuestionAnswered = function (questionid) {
                $scope.assAnswersByQuestionId[questionid].answered = true;
            };

        }]);