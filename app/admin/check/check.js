(function () {
    'use strict';

    angular.module('yp.admin')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('admin', {
                        abstract: true,
                        url: "/topic/:topicId",
                        templateUrl: "layout/single-column.html",
                        access: accessLevels.all,

                        resolve: {
                            campaign: ['$stateParams', function ($stateParams) {

                                if ($stateParams.topicId) {
                                    // returning a fake campaign to allow administration of assessments
                                    return {
                                        id: "fakecampaign",
                                        topic: $stateParams.topicId
                                    };
                                } else {
                                    return undefined;
                                }

                            }]
                        },
                        controller: ['$scope', function($scope) {
                            $scope.parentState = 'admin';
                        }]
                    })

                    .state('admin.check', {
                    url: "/check",
                    access: accessLevels.admin,
                    views: {
                        content: {
                            templateUrl: 'dhc/check/check.html',
                            controller: 'CheckController as checkController'
                        }
                    },
                    resolve: {
                        assessment: ['campaign', 'AssessmentService', function (campaign, AssessmentService) {

                            return AssessmentService.getAssessment(campaign.topic.id || campaign.topic);
                        }],
                        newestResult: ['campaign', 'AssessmentService', 'UserService', function (campaign, AssessmentService, UserService) {

                            return AssessmentService.getNewestAssessmentResults(campaign.topic.id || campaign.topic);
                        }],
                        assessmentIdea: ['ActivityService', 'assessment', function (ActivityService, assessment) {
                            return ActivityService.getIdea(assessment.idea.id || assessment.idea);
                        }]
                    },

                    onExit: ['AssessmentService', function (AssessmentService) {
                        return AssessmentService.regenerateRecommendations();
                    }]
                });
            }]);


}());