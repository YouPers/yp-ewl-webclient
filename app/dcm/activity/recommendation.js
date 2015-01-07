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

        .controller('RecommendationController', [ '$scope', '$state', '$stateParams', '$timeout',
            'UserService', 'SocialInteractionService', 'HealthCoachService', 'idea', 'socialInteraction', 'campaign',
            function ($scope, $state, $stateParams, $timeout,  UserService, SocialInteractionService, HealthCoachService, idea, socialInteraction, campaign) {

                $scope.idea = idea;
                $scope.campaign = campaign;


                $scope.minPublishDate = moment.max(moment(), moment(campaign.start)).toDate();

                $scope.recommendation = socialInteraction ? socialInteraction :  {

                    idea: idea.id,

                    author: UserService.principal.getUser(),
                    authorType: 'campaignLead',

                    targetSpaces: [{
                        type: 'campaign',
                        targetId: $stateParams.campaignId
                    }],

                    publishFrom: $scope.minPublishDate,
                    publishTo: moment.min(moment($scope.minPublishDate).add(3, 'days').endOf('day'), moment(campaign.end).endOf('day')).toDate(),
                    __t: "Recommendation"

                };


                $timeout(function () {

                    $scope.$watch('recommendation', function (val, old) {
                        $scope.recommendationController.dirty = old && !_.isEqual(val, old);

                    }, true);

                });

                $scope.deleteRecommendation = function () {

                    SocialInteractionService.deleteSocialInteraction($scope.recommendation.id).then(function () {
                        HealthCoachService.queueEvent('recommendationDeleted');
                        $state.go('dcm.home', $stateParams);
                    });

                };

                $scope.saveRecommendation = function saveRecommendation() {
                    $scope.$root.$broadcast('busy.begin', {url: "recommendations", name: "saveRecommendation"});
                    // ensure start of date / end of day for publish dates
                    var rec = $scope.recommendation;
                    rec.publishFrom = new Date(moment(rec.publishFrom).startOf('day'));
                    rec.publishTo = new Date(moment(rec.publishTo).endOf('day'));

                    if (!rec.id) {
                        SocialInteractionService.postRecommendation(rec).then(_cb);
                    } else {
                        SocialInteractionService.putSocialInteraction(rec).then(_cb);
                    }

                    function _cb(savedSoi) {
                        HealthCoachService.queueEvent('recommendationCreated');
                        $state.go('dcm.home', $stateParams);
                        $scope.$root.$broadcast('busy.end', {url: "recommendations", name: "saveRecommendation"});
                    }
                };

            }]);

}());