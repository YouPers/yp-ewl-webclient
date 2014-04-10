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

                var firstUnansweredCategory = function firstUnansweredCategory() {

                    // find first category that contains any question that has not been answered
                    var category = _.find(_.keys($scope.categories), function(category) {
                        return _.any($scope.categories[category], function(question) {

                            return !$scope.answers[question.id].answered;

                        });
                    });
                    return category;
                };


                $scope.cat = {}; // track open accordion group

                var category = firstUnansweredCategory();
                var categoryName = category ? category : 'general';
                $scope.cat[categoryName] = true;



                _.forEach($scope.answers, function(answer, key) {

                    $scope.$watch('answers["'+key+'"]', function(value, oldValue) {


                        if(value.answerType !== oldValue.answerType && value.answerType !== 'mid') {

                            if(value.answerType === 'min' && answer.answer >= 0) {
                                value.answer = '-50';
                            }
                            if(value.answerType === 'max' && answer.answer <= 0) {
                                value.answer = '50';
                            }
                            value.answered = true;
                        }

                        if(value.answer !== oldValue.answer && value.answer !== 0) {
                            value.answerType = (value.answer < 0 ? 'min' : 'max');
                        }


                        // TODO: do a throttled put of the new answer

                        putAnswer();
                    }, true);

                });

                var putAnswer = _.throttle(function putAnswer(answer) {
                    AssessmentService.putAnswer(answer);
                }, 1000);

            }
        ]);

}());