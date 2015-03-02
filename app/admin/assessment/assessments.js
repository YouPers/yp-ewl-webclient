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

        .controller('AdminAssessmentController', ['$rootScope', '$scope', 'AssessmentService', 'ActivityService', 'topics',
            function ($rootScope, $scope, AssessmentService, ActivityService, topics) {
                var adminAssessmentController = $scope.adminAssessmentController = this;
                $scope.topics = topics;
                adminAssessmentController.topic = topics[0].id;

                $scope.$watch('adminAssessmentController.topic', function (topic) {
                    if(topic) {
                        AssessmentService.getAssessment(topic.id || topic).then(function (assessment) {
                            ActivityService.populateIdeas(assessment).then(function (assessment) {
                                $scope.assessment = assessment;
                            });
                        });
                    }
                });
                $scope.uniqueValues = function (field) {
                    return _.unique(_.map($scope.assessment.questions, field));
                };


            }]);
}());
