(function () {
    'use strict';

    angular.module('yp.dcm')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', 'activityResolveConfiguration',
            function ($stateProvider, $urlRouterProvider, accessLevels, activityResolveConfiguration) {
                $stateProvider
                    .state('dcm.recommendation', {
                        url: "/recommendation/:idea/socialInteraction/:socialInteraction",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dcm/activity/recommendation.html',
                                controller: 'RecommendationController as recommendationController'
                            }
                        },
                        resolve: {

                            idea: ['$stateParams', 'ActivityService', function ($stateParams, ActivityService) {
                                var idea = $stateParams.idea;
                                if (!idea) {
                                    throw new Error('activity: stateParam idea is required');
                                }
                                return  ActivityService.getIdea(idea);
                            }],

                            socialInteraction: ['$stateParams', 'SocialInteractionService', function ($stateParams, SocialInteractionService) {
                                if ($stateParams.socialInteraction) {
                                    return  SocialInteractionService.getSocialInteraction($stateParams.socialInteraction);
                                } else {
                                    return undefined;
                                }
                            }]
                        }
                    });

            }])

        .controller('RecommendationController', [ '$scope', '$rootScope', '$state', '$stateParams', '$timeout',
            'UserService', 'SocialInteractionService', 'idea', 'socialInteraction',
            function ($scope, $rootScope, $state, $stateParams, $timeout,  UserService, SocialInteractionService, idea, socialInteraction) {

                $scope.idea = idea;

                $scope.recommendation = socialInteraction ? socialInteraction :  {

                    idea: idea.id,

                    author: UserService.principal.getUser(),
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
                    }],
                    __t: "Recommendation"

                };

                $timeout(function () {

                    $scope.$watch('recommendation', function (val, old) {
                        $scope.recommendationController.dirty = old && !_.isEqual(val, old);

                    }, true);

                });

                $scope.saveRecommendation = function saveRecommendation() {

                    // ensure start of date / end of day for publish dates
                    var rec = $scope.recommendation;
                    rec.publishFrom = new Date(moment(rec.publishFrom).startOf('day'));
                    rec.publishTo = new Date(moment(rec.publishTo).endOf('day'));

                    if (!rec.id) {
                        SocialInteractionService.postRecommendation(rec).then(cb);
                    } else {
                        SocialInteractionService.putSocialInteraction(rec).then(cb);
                    }

                    function cb() {
                        $scope.$emit('clientmsg:success', 'recommendation.saved');
                        $state.go('dcm.home');
                    }
                };

            }]);

}());