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

                            offers: ['SocialInteractionService', 'ActivityService', function(SocialInteractionService, ActivityService) {
                                return SocialInteractionService
                                        .getOffers({
                                    populate: ['author', 'activity']
                                    }).then(ActivityService.populateIdeas);
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
                                var closedEvents = missedEvents.concat(doneEvents);
                                return _.sortBy(closedEvents, function (event) {
                                    return - moment(event.start).valueOf();
                                });
                            }],

                            pastEvents: ['ActivityService', 'openEvents', function (ActivityService, openEvents) {
                                return _.filter(openEvents, function (event) {
                                    return moment().isAfter(event.start, 'day');
                                });
                            }],
                            presentEvents: ['ActivityService', 'openEvents', function (ActivityService, openEvents) {
                                return _.filter(openEvents, function (event) {
                                    return moment().isSame(event.start, 'day');
                                });
                            }],


                            healthCoachEvent: ['campaign', 'currentActivities', 'closedEvents', 'pastEvents', 'presentEvents', 'offers',
                                function (campaign, currentActivities, closedEvents, pastEvents, presentEvents, offers) {

                                    if(!campaign) {
                                        return;
                                    }

                                    function getEventName() {

                                        var daysUntilCampaignEnd = moment(campaign.end).diff(moment(), 'days', true);

                                        if(daysUntilCampaignEnd < 0) {
                                            return 'campaignEnded';
                                        } else if (daysUntilCampaignEnd < 1) {
                                            return 'campaignLastDay';
                                        } else if(currentActivities.length > 0 && daysUntilCampaignEnd < 7) {
                                            return 'campaignEndingWithCurrentActivities';
                                        } else if(closedEvents.length === 0 && offers.length === 0) {
                                            return 'noOffers';
                                        } else if(currentActivities.length === 0 && daysUntilCampaignEnd > 7) {
                                            return 'noCurrentActivities';
                                        } else if(pastEvents.length + presentEvents.length === 0 && currentActivities.length <=2 &&
                                            daysUntilCampaignEnd >= 7) {
                                            return 'noPastOrPresentEventsAndTooFewActivities';
                                        } else if(pastEvents.length + presentEvents.length === 0 && currentActivities.length > 2) {
                                            return 'noPastOrPresentEventsAndEnoughActivities';
                                        } else if((pastEvents.length > 0) && (presentEvents.length > 0)) {
                                            return 'pastAndPresentEvents';
                                        } else if(pastEvents.length > 0) {
                                            return 'pastEvents';
                                        } else if(presentEvents.length > 0) {
                                            return 'presentEvents';
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
            'healthCoachEvent', 'campaign',

            function ($scope, $state, $stateParams, $window,
                      activities, currentActivities, doneActivities,
                      offers, sortedOffers, dismissedOffers,
                      events, openEvents, missedEvents, doneEvents, closedEvents,
                      healthCoachEvent, campaign
                ) {

                $scope.healthCoachEvent = healthCoachEvent;

                if(campaign) {
                    $scope.campaign = campaign;
                    $scope.daysLeft = -moment().businessDiff(campaign.end);
                    $scope.campaignEnding = $scope.daysLeft <= 2;
                }

                $scope.view = $stateParams.view;

                $scope.doneActivities = doneActivities;

                $scope.offers = sortedOffers;
                $scope.offersDismissed = dismissedOffers;

                $scope.events = openEvents;
                $scope.eventsByActivity = _.groupBy($scope.events, 'activity');

                $scope.closedEvents = closedEvents;
                _.forEach($scope.doneEvents, function (event) {
                    event.activity = _.find($scope.activities, {id: event.activity });
                });

                // sort activities by the end date of the oldest event of an activity with the status 'open'
                $scope.activities = _.sortBy(currentActivities, function(activity) {

                    var openEventsOfThisActivity = _.filter($scope.eventsByActivity[activity.id], function(event) {
                        return event.status === 'open';
                    });

                    var oldestEvent = _.min(openEventsOfThisActivity, function(event) {
                        return moment(event.end).valueOf();
                    });
                    return oldestEvent.end;
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
                    }

                    // disabled for all events but the special events like the self-assessment
                    //else {
                    //    $state.go('dhc.activity', { idea: event.idea.id, activity: event.activity, socialInteraction: '', mode: '' });
                    //}
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