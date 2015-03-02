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
                                controller: 'AdminAssessmentController'
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

        .controller('AdminAssessmentController', ['$rootScope', '$scope', 'AssessmentService', 'topics',
            function ($rootScope, $scope, AssessmentService, topics) {

                $scope.topcis = topics;

                $scope.$watch('topic', function (topic) {
                    if(topic) {
                        AssessmentService.getAssessment(topic.id || topic).then(function (assessment) {
                            $scope.assessment = assessment;
                        });
                    }
                });


            }]);
}());
