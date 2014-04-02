(function () {
    'use strict';

    angular.module('yp.assessment', ['ui.router', 'restangular', 'vr.directives.slider', 'yp.user', 'yp.activity' ])

        // configuration of routes for all assessment module pages
        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('assessment', {
                        url: "/assessment/:assessmentId",
                        templateUrl: "yp.assessment/yp.assessment.html",
                        controller: "AssessmentCtrl",
                        access: accessLevels.all,
                        resolve: {
                            assessmentData: ['AssessmentService', '$stateParams',
                                function (AssessmentService, $stateParams) {
                                    return AssessmentService.getAssessmentData($stateParams.assessmentId);
                                }]
                        }
                    })
                    .state('assessmentResult', {
                        url: "/assessment/:assessmentId/result",
                        templateUrl: "yp.assessment/yp.assessment.result.html",
                        controller: "AssessmentResultCtrl",
                        access: accessLevels.individual,
                        resolve: {
                            assessment: ['AssessmentService', function (AssessmentService) {
                                return AssessmentService.getAssessment('525faf0ac558d40000000005');
                            }],
                            assessmentResults: ['AssessmentService', function (AssessmentService) {
                                return AssessmentService.getAssessmentResults('525faf0ac558d40000000005');
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('yp.assessment/yp.assessment');
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


    // hardcoded filtering out of general stress level
    // todo: replacing hardcoded question id
        .
        filter('stripGeneralLevel', function () {
            return function (input) {
                var output = [];
                for (var i = 0; i < input.length; i++) {
                    if (input[i].question !== "5278c51a6166f2de240000df") {
                        output.push(input[i]);
                    }
                }
                return output;
            };
        });

}());
