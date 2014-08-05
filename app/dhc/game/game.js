(function () {
    'use strict';

    angular.module('yp.dhc')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('game', {
                        templateUrl: "layout/default.html",
                        access: accessLevels.all
                    })
                    .state('game.content', {
                        url: "/game",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dhc/game/game.html',
                                controller: 'GameController'
                            }
                        },
                        resolve: {
                            activities: ['ActivityService', function(ActivityService) {
                                return ActivityService.getActivities({ populate: 'idea' });
                            }],
                            socialInteractions: ['SocialInteractionService', function(SocialInteractionService) {
                                return SocialInteractionService.getSocialInteractions();
                            }],
                            activityEvents: ['ActivityService', function(ActivityService) {
                                return ActivityService.getActivityEvents({populate: 'idea'});
                            }]
                        }
                    });


                $translateWtiPartialLoaderProvider.addPart('dhc/game/game');
            }])


        .controller('GameController', [ '$scope', '$state', '$window', 'activities', 'socialInteractions', 'activityEvents',
            function ($scope, $state, $window, activities, socialInteractions, activityEvents) {

                $scope.activities = _.filter(activities, { status: 'active' });
                $scope.doneActivities = _.filter(activities, { status: 'old' });

                $scope.invitations = _.filter(socialInteractions, { __t: 'Invitation' });
                $scope.recommendations = _.filter(socialInteractions, { __t: 'Recommendation' });

                $scope.openEvents = _.filter(activityEvents, {status: 'open'});

                $scope.eventsByIdea = _.groupBy(activityEvents, function(event) {
                    return event.idea.id;
                });

                $scope.showIdeas = function(status, hovered) {
                    if(_.isUndefined(hovered) || hovered) {
                        $window.location = $state.href("idea.list") + '?status=' + status;
                    }
                };

                $scope.openActivity = function(activity) {


                    if(activity.idea.action) {
                        if(activity.idea.action === 'assessment') {
                            $state.go('check.content');
                        } else if(activity.idea.action === 'focus') {
                            $state.go('focus.content');
                        } else {
                            throw new Error('unknown action');
                        }
                    } else {
                        $window.location = $state.href('activity.content', { id: activity.id }) + '?idea=' + activity.idea.id;
                    }

                    return false;

                };

            }]);

}());