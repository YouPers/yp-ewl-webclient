(function () {
    'use strict';

    angular.module('yp.dcm')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('dcm.activity', {
                        url: "/idea/:idea/activity/:activity/:mode",
                        access: accessLevels.campaignlead,

                        views: {
                            content: {
                                templateUrl: 'dcm/activity/activity.html',
                                controller: 'DcmActivityController'
                            }
                        },
                        resolve: {
                            idea: ['$stateParams', 'ActivityService', function ($stateParams, ActivityService) {
                                if(!$stateParams.idea) {
                                    throw new Error('state parameter "idea" is required');
                                }
                                return ActivityService.getIdea($stateParams.idea);
                            }],
                            activity: ['$stateParams', 'ActivityService', function ($stateParams, ActivityService) {
                                if(!$stateParams.activity) {
                                    return ActivityService.getDefaultActivity($stateParams.idea);
                                } else {
                                    return ActivityService.getActivity($stateParams.activity);
                                }
                            }]
                        }
                    });


                $translateWtiPartialLoaderProvider.addPart('dcm/activity/activity');
            }])


        .controller('DcmActivityController', [ '$scope', '$rootScope', '$state', '$stateParams',
            'ActivityService', 'UserService', 'SocialInteractionService', 'idea', 'activity',
            function ($scope, $rootScope, $state, $stateParams, ActivityService, UserService, SocialInteractionService, idea, activity) {



                $scope.idea = idea;
                $scope.activity = activity;
                $scope.activity.idea = idea;

                $scope.recommendation = {

                    idea: idea.id,

                    author: UserService.principal.getUser().id,
                    authorType: 'campaignLead',

                    targetSpaces: [{
                        type: 'campaign',
                        targetId: $stateParams.campaignId
                    }],

                    publishFrom: new Date(moment().startOf('day')),
                    publishTo: new Date(moment().endOf('day')),

                    refDocs: [{
                        docId: idea.id,
                        model: 'Idea'
                    }]

                };

                $scope.saveRecommendation = function saveRecommendation() {
                    SocialInteractionService.postRecommendation($scope.recommendation).then(function() {
                        $scope.$emit('clientmsg:success', 'recommendation.saved');
                        $state.go('dcm.home');
                    });
                };

            }
        ]);


}());