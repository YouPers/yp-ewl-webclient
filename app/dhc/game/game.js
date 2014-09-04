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

                function sortOffers(list) {
                    function sortByDate(offer) {
                        return - new Date(offer.publishFrom || offer.created).getTime();
                    }
                    function addResult(target, source, cb) {
                        return target.concat(source.splice(_.findIndex(source, cb), 1));
                    }
                    var sorted = _.sortBy(list, sortByDate); // newest first
                    var result = [];
                    // find and remove first 3 offer types, add them to the results
                    result = addResult(result, sorted, { authorType: 'coach' });
                    result = addResult(result, sorted, { authorType: 'campaignLead' });
                    result = addResult(result, sorted, function(offer) {
                        return offer.authorType !== 'campaignLead' && offer.__t === 'Invitation';
                    });
                    result = result.concat(sorted); // add the rest
                    return result;
                }

                $scope.offers = _.filter(offers, function(si) {
                    return !(si.dismissed || si.rejected);
                });
                $scope.offers = sortOffers($scope.offers);

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

                // sort activities by the end date of the oldest event of an activity with the status 'open'
                $scope.activities = _.sortBy($scope.activities, function(activity) {
                    return _.max(_.filter($scope.eventsByActivity, { status: 'open' }), function(event) {
                        return new Date(event.end).getTime();
                    });
                });

                $scope.showIdeas = function(status, hovered) {
                    if(_.isUndefined(hovered) || hovered) {
                        $window.location = $state.href("idea.list") + '?status=' + status;
                    }
                };

                $scope.openActivity = function(activity) {
                    if(activity.idea.action) {
                        if(activity.idea.action === 'assessment') {
                            $state.go('dhc.check');
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