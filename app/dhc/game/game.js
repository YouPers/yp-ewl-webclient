(function () {
    'use strict';

    angular.module('yp.dhc')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('dhc.game', {
                        url: "/game/:view",
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

                            currentActivities: ['activities', function (activities) {
                                return _.filter(activities, { status: 'active' });
                            }],
                            doneActivities: ['activities', function (activities) {
                                return _.filter(activities, { status: 'old' });
                            }],

                            offers: ['SocialInteractionService', function(SocialInteractionService) {
                                return SocialInteractionService.getOffers({
                                    populate: ['author', 'refDocs']
                                });
                            }],
                            sortedOffers: ['offers', function (offers) {


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

                                var filteredOffers = _.filter(offers, function(si) {
                                    return !(si.dismissed || si.rejected);
                                });
                                return sortOffers(filteredOffers);

                            }],
                            dismissedOffers: ['offers', function (offers) {

                                var offersDismissed = _.filter(offers, function(si) {
                                    return si.dismissed || si.rejected;
                                });
                                var dismissedOffers = [];
                                _.forEach(offersDismissed, function (sid) {
                                    dismissedOffers.push({
                                        activity: sid.activity,
                                        idea: sid.idea || sid.activity.idea,
                                        socialInteraction: sid
                                    });
                                });
                                return dismissedOffers;
                            }],


                            events: ['ActivityService', function(ActivityService) {
                                return ActivityService.getActivityEvents();
                            }],

                            openEvents: ['events', function (events) {
                                return _.filter(events, {status: 'open'}).reverse();
                            }],

                            missedEvents: ['events', function (events) {
                                return _.filter(events, {status: 'missed'});
                            }],

                            doneEvents: ['events', function (events) {
                                return _.filter(events, {status: 'done'});
                            }],

                            closedEvents: ['missedEvents', 'doneEvents', function (missedEvents, doneEvents) {
                                return missedEvents.concat(doneEvents);
                            }],

                            pastEvents: ['ActivityService', 'openEvents', function (ActivityService, openEvents) {
                                return _.filter(openEvents, function (event) {
                                    return ActivityService.getActivityEventDueState(event) === 'Past';
                                });
                            }],
                            presentEvents: ['ActivityService', 'openEvents', function (ActivityService, openEvents) {
                                return _.filter(openEvents, function (event) {
                                    return ActivityService.getActivityEventDueState(event) === 'Present';
                                });
                            }],


                            healthCoachEvent: ['campaign', 'currentActivities', 'closedEvents', 'pastEvents', 'presentEvents',
                                function (campaign, currentActivities, closedEvents, pastEvents, presentEvents) {

                                    if(!campaign) {
                                        return;
                                    }

                                    function getEventName() {

                                        var daysUntilCampaignEnd = moment(campaign.end).diff(moment(), 'days');

                                        if(currentActivities.length > 0 && daysUntilCampaignEnd < 7) {
                                            return 'campaignEndingWithCurrentActivities';
                                        } else if(daysUntilCampaignEnd < 0) {
                                            return 'campaignEnded';
                                        } else if(currentActivities.length === 1 && closedEvents.length === 0) {
                                            return 'noDoneEvents';
                                        } else if(currentActivities.length === 0 && daysUntilCampaignEnd < 7) {
                                            return 'noCurrentActivities';
                                        } else if(pastEvents.length + presentEvents.length === 0 && currentActivities.length <=2 &&
                                            daysUntilCampaignEnd >= 7) {
                                            return 'noPastOrPresentEventsAndTooFewActivities';
                                        } else if(pastEvents.length + presentEvents.length === 0 && currentActivities.length > 2) {
                                            return 'noPastOrPresentEventsAndEnoughActivities';
                                        } else if(pastEvents.length + presentEvents.length > 0) {
                                            return 'pastOrPresentEvents';
                                        } else if(pastEvents.length > 0) {
                                            return 'pastEvents';
                                        }
                                    }

                                    return getEventName();

                                }]
                        }
                    });


                $translateWtiPartialLoaderProvider.addPart('dhc/game/game');
            }])


        .controller('GameController', [ '$scope', '$state', '$stateParams', '$window',
            'activities', 'currentActivities', 'doneActivities',
            'offers', 'sortedOffers', 'dismissedOffers',
            'events', 'openEvents', 'missedEvents', 'doneEvents', 'closedEvents',
            'healthCoachEvent',

            function ($scope, $state, $stateParams, $window,
                      activities, currentActivities, doneActivities,
                      offers, sortedOffers, dismissedOffers,
                      events, openEvents, missedEvents, doneEvents, closedEvents,
                      healthCoachEvent
                ) {

                $scope.healthCoachEvent = healthCoachEvent;

                $scope.view = $stateParams.view;

                $scope.activities = currentActivities;
                $scope.doneActivities = doneActivities;

                $scope.offers = sortedOffers;
                $scope.offersDimissed = dismissedOffers;

                $scope.events = openEvents;
                $scope.eventsByActivity = _.groupBy($scope.events, 'activity');

                $scope.closedEvents = closedEvents;
                _.forEach($scope.doneEvents, function (event) {
                    event.activity = _.find($scope.activities, {id: event.activity });
                });

                // sort activities by the end date of the oldest event of an activity with the status 'open'
                $scope.activities = _.sortBy($scope.activities, function(activity) {
                    return _.max(_.filter($scope.eventsByActivity, function(activity) {
                        return activity.status === 'active';
                    }), function(event) {
                        return new Date(event.end).getTime();
                    });
                });

                $scope.showIdeas = function(status, hovered) {
                    if(_.isUndefined(hovered) || hovered) {
                        $window.location = $state.href("idea.list") + '?status=' + status;
                    }
                };

                $scope.openIdea = function(idea) {

                    if(idea.action) {

                        if(idea.action === 'assessment') {
                            $state.go('dhc.check');
                        } else if(idea.action === 'focus') {
                            $state.go('focus.content');
                        } else {
                            throw new Error('unknown action');
                        }
                    } else {
                        $state.go('dhc.activity', { idea: idea.id });
                    }

                };
                $scope.openDoneEvent = function(event) {
                    if(event.idea && event.idea.action) {
                        $scope.openIdea(event.idea);
                    } else {
                        $state.go('dhc.activity', { idea: event.idea.id, activity: event.activity, socialInteraction: '', mode: '' });
                    }
                };
                $scope.openActivity = function(activity) {
                    if(activity.idea.action) {
                        $scope.openIdea(activity.idea);
                    } else {
                        $state.go('dhc.activity', { idea: activity.idea.id, activity: activity.id, socialInteraction: '', mode: '' });
                    }
                };

                $scope.openSocialInteraction = function(socialInteraction) {

                    $state.go('dhc.activity', {
                        idea: socialInteraction.idea.id,
                        activity: socialInteraction.activity ? socialInteraction.activity.id : '',
                        socialInteraction: socialInteraction.id
                    });

                };
            }]);

}());