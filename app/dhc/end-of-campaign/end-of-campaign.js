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

                            jsInclude: ["util", function (util) {
                                return util.loadJSIncludes(['lib/d3/d3.min.js', 'lib/nvd3/nv.d3.min.js']);
                            }],

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

        .controller('EndOfCampaignController', [ '$scope', 'UserService',
            'assessmentResult', 'topStressors', 'assessment',
            function ($scope, UserService, assessmentResult, topStressors, assessment) {

                $scope.campaign = UserService.principal.getUser().campaign;
                $scope.daysLeft = - moment().diff($scope.campaign.end, 'days');
                $scope.campaignEnded = moment().diff($scope.campaign.end) > 0;

                $scope.eventStatusData = [
                    {
                        "key": "Deine Ergebnisse",
                        "values": [ [ 'done' , 3] , [ 'missed' , 4] , [ 'open' , 2] ]
                    },
                    {
                        "key": "Durschnitt der Kampagne",
                        "values": [ [ 'done' , 2.4] , [ 'missed' , 2.3] , [ 'open' , 4.6] ]
                    }
                ];

                $scope.eventFeedbackYAxisTickFormat = function (value) {
                    return value * 100 + '%';
                };

                $scope.eventFeedbackData = [
                    {
                        "key": "Deine Bewertungen",
                        "values": [ [ '1' , 0.2] , [ '3' , 0.4] , [ '5' , 0.1] ]
                    },
                    {
                        "key": "Durschnitt der Kampagne",
                        "values": [ [ '1' , 0.4] , [ '3' , 0.4] , [ '5' , 0.2] ]
                    }
                ];



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