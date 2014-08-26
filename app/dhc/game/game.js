(function () {
    'use strict';

    angular.module('yp.dhc')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('dhc.game', {
                        url: "/game",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dhc/game/game.html',
                                controller: 'GameController as gameController'
                            }
                        },
                        resolve: {
                            activities: ['ActivityService', function(ActivityService) {
                                return ActivityService.getActivities();
                            }],
                            offers: ['SocialInteractionService', function(SocialInteractionService) {
                                return SocialInteractionService.getOffers({
                                    populate: 'author refDocs'
                                });
                            }],
                            activityEvents: ['ActivityService', function(ActivityService) {
                                return ActivityService.getActivityEvents();
                            }]
                        }
                    });


                $translateWtiPartialLoaderProvider.addPart('dhc/game/game');
            }])


        .controller('GameController', [ '$scope', '$state', '$window', 'activities', 'offers', 'activityEvents',
            function ($scope, $state, $window, activities, offers, activityEvents) {

                $scope.activities = _.filter(activities, { status: 'active' });
                $scope.doneActivities = _.filter(activities, { status: 'old' });

                var offers = _.filter(offers, function(si) {
                    return si.__t === 'Recommendation' || si.__t === 'Invitation';
                });
                $scope.offers = _.filter(offers, function(si) {
                    return !(si.dismissed || si.rejected);
                });
                var offersDismissed = _.filter(offers, function(si) {
                    return si.dismissed || si.rejected;
                });
                $scope.dismissedEvents = [];
                _.forEach(offersDismissed, function (sid) {
                    $scope.dismissedEvents.push({
                        activity: sid.activity,
                        idea: sid.idea || sid.activity.idea,
                        socialInteraction: sid
                    });
                });

                $scope.events = _.filter(activityEvents, {status: 'open'}).reverse();
                $scope.eventsByActivity = _.groupBy($scope.events, 'activity');

                $scope.doneEvents = _.filter(activityEvents, function(event) {
                    return event.status === 'done' || event.status === 'missed';
                });
                _.forEach($scope.doneEvents, function (event) {
                    event.activity = _.find($scope.activities, {id: event.activity });
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
                        $state.go('dhc.activity', { idea: activity.idea.id, activity: activity.id });
                    }
                };

                $scope.openSocialInteraction = function(socialInteraction) {

                    $state.go('dhc.activity', {
                        idea: socialInteraction.idea.id,
                        activity: socialInteraction.activity ? socialInteraction.activity.id : undefined,
                        socialInteraction: socialInteraction.id
                    });

                };

            }]);

}());