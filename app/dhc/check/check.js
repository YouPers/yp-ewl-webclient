(function () {
    'use strict';

    angular.module('yp.dhc')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('check', {
                        templateUrl: "layout/default.html",
                        access: accessLevels.user
                    })
                    .state('check.content', {
                        url: "/check",
                        access: accessLevels.user,
                        views: {
                            content: {
                                templateUrl: 'dhc/check/check.html',
                                controller: 'CheckController'
                            }
                        },
                        resolve: {
                            assessment: ['AssessmentService', 'UserService', '$q', function (AssessmentService, UserService, $q) {
                                var currentUsersCampaign = UserService.principal.getUser().campaign;
                                if (!currentUsersCampaign) {
                                    return $q.reject('User is not part of a camapaign, Assessment only possible when user is part of a camapgin');
                                }
                                return AssessmentService.getAssessment(currentUsersCampaign.topic);
                            }],
                            newestResult: ['AssessmentService', 'UserService', function (AssessmentService, UserService) {
                                var currentUsersTopic = UserService.principal.getUser().campaign.topic;
                                return AssessmentService.getNewestAssessmentResults(currentUsersTopic);
                            }]
                        },
                        onExit: ['AssessmentService', function(AssessmentService) {
                            return AssessmentService.regenerateRecommendations();
                        }]

                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/check/check');
            }])

        .controller('CheckController', [ '$scope', '$rootScope', '$state', '$timeout', 'assessment', 'newestResult', 'AssessmentService',
            function ($scope, $rootScope, $state, $timeout, assessment, newestResult, AssessmentService) {

                $scope.orderedCategoryNames = _.uniq(_.map(assessment.questions, 'category'));
                $scope.categories = _.groupBy(assessment.questions, 'category');


                // setup helper values for UI-controls
                _.forEach(newestResult.answers, function(myAnswer) {
                    if (!_.isNull(myAnswer.answer)) {
                        myAnswer.answerType = myAnswer.answer === 0 ? 'mid' :
                            (myAnswer.answer < 0 ? 'min' : 'max');
                        myAnswer.answerValue = parseInt(Math.abs(myAnswer.answer));
                    } else {
                        myAnswer.answerType = null;
                        myAnswer.answerValue = null;
                    }
                });


                // FIX for slider issue: not working if they have not been visible, reinitialize with a string value
                $scope.reinitialize = function () {
                    _.forEach($scope.answers, function(answer) {
                        if(answer.answerValue) {
                            answer.answerValue = answer.answerValue.toString();
                        }
                    });

                };


                $scope.answers = newestResult.keyedAnswers;

                function firstUnansweredCategory() {
                    return _.find($scope.orderedCategoryNames, function(catName) {
                        return _.any($scope.categories[catName], function(question) {
                            return _.isNull($scope.answers[question.id].answer);
                        });
                    });

                }


                $scope.cat = {}; // track open accordion group

                var firstUnansweredCat = firstUnansweredCategory();

                if (firstUnansweredCat) {
                    $scope.cat[firstUnansweredCat] = true;
                }

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
                                putAnswer(answer);
                            }
                        }

                    });
                    $scope.$watch('answers["'+key+'"].answerValue', function(value, oldValue) {


                        if((!value && value !== 0) || parseInt(value) === parseInt(oldValue)) {
                            return;
                        }

                        var answer = $scope.answers[key];

                        answer.answer = answer.answerType === 'mid' ? 0 : (answer.answerType === 'min' ? -value : value);

                        putAnswer(answer);

                    }, true);

                });

                var throtteledFunctions = {};

                var putAnswer = function(answer) {
                    if (!throtteledFunctions[answer.question]) {
                        throtteledFunctions[answer.question] = _.throttle(function putAnswer(answer) {
                            AssessmentService.putAnswer(answer);
                        }, 1000);
                    }
                    return throtteledFunctions[answer.question](answer);

                };




                $scope.displayInfo = function(question) {
                    $rootScope.$emit('healthCoach:displayMessage', renderCoachMessageFromQuestion(question));
                };

                function renderCoachMessageFromQuestion(question) {
                    // the Coach speaks MARKDOWN!
                    var myText =  question.exptext + '\n\n';
                    if (question.mintext !== 'n/a') {
                        myText += '**' + question.mintext + ':** ' + question.mintextexample +'\n\n';
                    }
                    if (question.midtext !== 'n/a') {
                        myText += '**' + question.midtext + ':** ' + question.midtextexample +'\n\n';
                    }
                    if (question.maxtext !== 'n/a') {
                        myText += '**' + question.maxtext + ':** ' + question.maxtextexample +'\n\n';
                    }
                    return myText;
                }

            }
        ])

        .filter('answeredCount', function() {
            return function(questions, answers) {
                var answered = 0;
                for (var i = 0; i < questions.length; i++) {
                    if (!_.isNull(answers[questions[i].id].answer)) {
                        answered++;
                    }
                }

                return answered;
            };
        });

}());