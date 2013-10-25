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
        Restangular.extendModel('assessments', function (assessment, user) {

            assessment.getNewEmptyAssResult = function () {
                var emptyResult = {
                    assessment: assessment.id,
                    answers: []
                };
                for (var i = 0; i < assessment.questionCats.length; i++) {
                    var questionCat = assessment.questionCats[i];
                    for (var j = 0; j < questionCat.questions.length; j++) {
                        var question = questionCat.questions[j];
                        var answer = {
                            assessment: assessment.id,
                            question: question.id,
                            answer: 0,
                            answered: false
                        };
                        emptyResult.answers.push(answer);
                    }
                }
                return emptyResult;

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
                    );
                }
                // run the one/two calls in parallel and then processes the results
                return $q.all(neededCalls).then(function (results) {
                    var assessment = results[0];

                    // check whether we got saved answers for this user and this assessment
                    var assResult;
                    if (results[1] && results[1].length >0) {
                        assResult = results[1];
                        // convert into a new Result, otherwise we overwrite the old one
                        delete assResult.id;
                    } else {
                        // got no answers from server, need to generate default answers
                        assResult = assessment.getNewEmptyAssResult();
                    }

                    // sort answers into keyed object (by question_id) to ease access by view
                    assResult.keyedAnswers = {};
                    _.forEach(assResult.answers, function (myAnswer) {
                        assResult.keyedAnswers[myAnswer.question] = myAnswer;
                    });

                    // return both, assessment and assResult in a simple object
                    return {
                        assessment: assessment,
                        result: assResult
                    };
                });
             },
            getAssessment: function(assessmentId) {
                return Restangular.one('assessments', assessmentId).get();
            },
            postResults: function (assResult, callback) {
                var assessmentResultBase = Restangular.one('assessments', assResult.assessment).all('results');
                assessmentResultBase.post(assResult).then(callback);
            }
        };

        return assService;
    }])

    // Controller to display an assessment and process the answers
    // assessmentData is resolved on stateTransfer
    .controller('AssessmentCtrl', ['$scope', '$rootScope', '$state', 'assessmentData','AssessmentService',
        function ($scope, $rootScope, $state, assessmentData, AssessmentService) {

            $scope.assessment = assessmentData.assessment;
            $scope.result = assessmentData.result;
            $scope.assAnswersByQuestionId = assessmentData.result.keyedAnswers;

            $scope.assessmentDone = function () {
                if (!$scope.principal.isAuthenticated()) {
                    $rootScope.$broadcast('loginMessageShow');
                } else {
                    assessmentData.result.timestamp = new Date();
                    assessmentData.result.owner = $scope.principal.getUser().id;
                    delete assessmentData.result.id;

                    AssessmentService.postResults(assessmentData.result, function(result) {
                        console.log("result posted: " + result);
                    });

                     $state.go('activitylist');

                }
            };

            $scope.setQuestionAnswered = function (questionid) {
                $scope.assAnswersByQuestionId[questionid].dirty = true;
            };

        }]);