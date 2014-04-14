(function () {
    'use strict';

    angular.module('yp.dhc.check',
        [
            'restangular',
            'ui.router'
        ])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('check', {
                        templateUrl: "layout/default.html",
                        access: accessLevels.all
                    })
                    .state('check.content', {
                        url: "/check",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dhc/check/check.html',
                                controller: 'CheckController'
                            }
                        },
                        resolve: {
                            assessmentData: ['$stateParams', 'AssessmentService', function ($stateParams, AssessmentService) {
                                return AssessmentService.getAssessmentData('525faf0ac558d40000000005');
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/check/check');
            }])

        .controller('CheckController', [ '$scope', '$rootScope', '$state', '$timeout', 'assessmentData', 'AssessmentService',
            function ($scope, $rootScope, $state, $timeout, assessmentData, AssessmentService) {


                $scope.categories = _.groupBy(assessmentData.assessment.questions, 'category');
                $scope.answers = assessmentData.result.keyedAnswers;

//                var firstUnansweredCategory = function firstUnansweredCategory() {
//
//                    // find first category that contains any question that has not been answered
//                    var category = _.find(_.keys($scope.categories), function(category) {
//                        return _.any($scope.categories[category], function(question) {
//
//                            return !$scope.answers[question.id].answered;
//
//                        });
//                    });
//                    return category;
//                };


                $scope.cat = {}; // track open accordion group

//                var category = firstUnansweredCategory();
//                var categoryName = category ? category : 'general';

                // TODO: define when a question should be counted as 'answered' => with manual slider or just too low/much

//                $scope.cat['general'] = true;



                _.forEach($scope.answers, function(answer, key) {

                    $scope.$watch('answers["'+key+'"].answerType', function(value, oldValue) {

                        var answer = $scope.answers[key];

                        if(value && value !== oldValue) {

                            if(value === 'mid') {
                                answer.answer = 0;
                                answer.answerValue = 0;
                            } else {
                                answer.answer = value === 'min' ? -50 : 50;
                                answer.answerValue = 50;
                            }
                        }

                    });
                    $scope.$watch('answers["'+key+'"].answerValue', function(value, oldValue) {


                        if((!value && value !== 0) || value === parseInt(oldValue)) {
                            return;
                        }

                        var answer = $scope.answers[key];

                        answer.answer = answer.answerType === 'mid' ? 0 : (answer.answerType === 'min' ? -value : value);

                        answer.answered = true;
                        putAnswer(answer);

                    }, true);

                });

                var putAnswer = _.throttle(function putAnswer(answer) {
                    AssessmentService.putAnswer(answer);
                }, 1000);

            }
        ]);

}());