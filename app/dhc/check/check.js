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

                    $scope.$watch('answers["'+key+'"].answerType', function(value, oldValue) {

                        var answer = $scope.answers[key];

                        if(value && value !== oldValue) {

                            if(value === 'min' && answer.answer >= 0) {
                                answer.answer = '-50';
                            }
                            if(value === 'max' && answer.answer <= 0) {
                                answer.answer = '50';
                            }
                            if(value === 'mid') {
                                answer.answer = '0';
                            }
                        }

                    });
                    $scope.$watch('answers["'+key+'"].answer', function(value, oldValue) {


                        if(!value || value === parseInt(oldValue)) {
                            return;
                        }

                        var answer = $scope.answers[key];

                        if(value != 0) {
                            answer.answerType = (value < 0 ? 'min' : 'max');
                        }

                        answer.answered = true;
                        postAnswer(answer);

                    }, true);

                });

                var postAnswer = _.throttle(function postAnswer(answer) {
                    AssessmentService.postAnswer(answer);
                }, 1000);

            }
        ]);

}());