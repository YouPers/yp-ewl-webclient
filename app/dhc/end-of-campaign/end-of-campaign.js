(function () {
    'use strict';

    angular.module('yp.dhc')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('dhc.end-of-campaign', {
                        url: "/end",
                        access: accessLevels.user,
                        views: {
                            content: {
                                templateUrl: 'dhc/end-of-campaign/end-of-campaign.html',
                                controller: 'EndOfCampaignController as endOfCampaignController'
                            }
                        },
                        resolve: {

                            assessmentResult: ['AssessmentService','UserService', '$q', function(AssessmentService, UserService, $q) {
                                var currentUsersCampaign = UserService.principal.getUser().campaign;
                                if (!currentUsersCampaign) {
                                    return $q.reject('User is not part of a camapaign, Assessment only possible when user is part of a camapgin');
                                }
                                return AssessmentService.getNewestAssessmentResults(currentUsersCampaign.topic.id || currentUsersCampaign.topic);
                            }],
                            topStressors: ['AssessmentService','UserService', '$q', function (AssessmentService, UserService, $q) {
                                var currentUsersCampaign = UserService.principal.getUser().campaign;
                                if (!currentUsersCampaign) {
                                    return $q.reject('User is not part of a camapaign, Assessment only possible when user is part of a camapgin');
                                }
                                return AssessmentService.topStressors(currentUsersCampaign.topic.id || currentUsersCampaign.topic);
                            }],
                            assessment: ['AssessmentService','UserService', '$q', function (AssessmentService, UserService, $q) {
                                var currentUsersCampaign = UserService.principal.getUser().campaign;
                                if (!currentUsersCampaign) {
                                    return $q.reject('User is not part of a camapaign, Assessment only possible when user is part of a camapgin');
                                }
                                return AssessmentService.getAssessment(currentUsersCampaign.topic.id || currentUsersCampaign.topic);
                            }]

                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/end-of-campaign/end-of-campaign');
            }])

        .controller('EndOfCampaignController', [ '$scope', 'campaign',
            'assessmentResult', 'topStressors', 'assessment',
            function ($scope, campaign, assessmentResult, topStressors, assessment) {

                $scope.campaign = campaign;
                $scope.daysLeft = - moment().diff(campaign.end, 'days');
                $scope.campaignEnded = moment().diff(campaign.end) > 0;



                $scope.needForAction = assessmentResult? assessmentResult.needForAction : null;
                $scope.categories = _.uniq(_.map(assessment.questions, 'category'));

                $scope.needForActionClass = function(category) {


                    var need = $scope.needForAction[category];

                    var level = !need || need < 1 ? "none" :
                        need < 4 ? "low" :
                            need < 7 ? "medium" : "high";

                    var obj  = {};
                    obj[level] = true;
                    return obj;

                };

                $scope.needForActionStyle = function(category) {
                    return {
                        width: $scope.needForAction[category] * 10 * 0.6 + '%'
                    };
                };


            }
        ]);

}());