(function () {
    'use strict';


    angular.module('yp.admin')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {

                $stateProvider
                    .state('admin.assessments', {
                        url: '/assessments',

                        views: {
                            content: {
                                templateUrl: 'admin/assessment/assessments.html',
                                controller: 'AdminAssessmentController as adminAssessmentController'
                            }
                        },
                        access: accessLevels.admin,

                        resolve: {
                            topics: ['TopicService', function(TopicService) {
                                return TopicService.getTopics();
                            }]
                        }
                    });

                //$translateWtiPartialLoaderProvider.addPart('admin/assessment/assessments');
            }])

        .controller('AdminAssessmentController', ['$rootScope', '$scope', '$timeout', '$q', 'util', 'AssessmentService', 'ActivityService', 'topics',
            function ($rootScope, $scope, $timeout, $q, util, AssessmentService, ActivityService, topics) {
                var adminAssessmentController = $scope.adminAssessmentController = this;
                $scope.topics = topics;
                adminAssessmentController.topic = topics[0].id;

                function reload() {

                    AssessmentService.getAssessment(adminAssessmentController.topic).then(function (assessment) {
                        ActivityService.populateIdeas(assessment).then(function (assessment) {

                            $scope.questions = assessment.questions;

                            $scope.assessment = _.clone(assessment);
                            delete $scope.assessment.questions;

                            $scope.cloned = {
                                assessment: _.clone(assessment),
                                questions: _.cloneDeep($scope.questions)
                            };

                            $scope.assessmentForm.$setPristine();

                        });
                    });
                }

                $scope.$watch('adminAssessmentController.topic', function (topic) {
                    if(topic) {
                        reload();
                    }
                });

                $scope.types = 'twoSided leftSided rightSided'.split(' ');

                $scope.uniqueValues = function (field) {
                    return _.unique(_.map($scope.questions, field));
                };

                $scope.addQuestion = function () {
                    $scope.questions.unshift({ assessment: $scope.assessment.id });
                };
                $scope.deleteQuestion = function (question) {
                    if(!question.id) {
                        _.remove($scope.questions, { id: question.id });
                        return;
                    }
                    if(!window.confirm("Are you sure?!")) {
                        return;
                    }
                    AssessmentService.deleteQuestion($scope.assessment.id, question).then(function () {
                        _.remove($scope.questions, { id: question.id });
                        $scope.assessment.questions = $scope.questions;
                        AssessmentService.saveAssessment($scope.assessment).then(function () {

                            reload();
                        });
                    });
                };


                $scope.move = util.move;

                $scope.save = _.debounce(function () {

                    var saveQuestions = [];
                    _.each($scope.questions, function (question, index) {
                        saveQuestions.push(AssessmentService.saveQuestion($scope.assessment, question).then(function (saved) {
                            $scope.questions[index] = saved;
                        }));
                    });

                    $q.all(saveQuestions).then(function () {

                        $scope.assessment.questions = $scope.questions;
                        AssessmentService.saveAssessment($scope.assessment).then(function () {

                            reload();
                        });

                    });


                }, 500);


            }]);
}());
