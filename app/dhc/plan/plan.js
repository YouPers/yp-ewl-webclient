(function () {
    'use strict';

    angular.module('yp.dhc')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('plan', {
                        templateUrl: "layout/default.html",
                        access: accessLevels.user
                    })
                    .state('plan.offer', {
                        url: "/plan",
                        access: accessLevels.user,
                        views: {
                            content: {
                                templateUrl: 'dhc/plan/plan.html',
                                controller: 'PlanController'
                            }
                        },
                        resolve: {
                            events: ['$stateParams', 'ActivityService', function ($stateParams, ActivityService) {
                                return ActivityService.getActivityEvents(
                                    {
                                        'filter[status]': 'open',
                                        'populate': [ 'idea activityPlan'],
                                        'populatedeep': ['owner joiningUsers']
                                    });
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/plan/plan');
            }])

        .controller('PlanController', [ '$scope', '$rootScope', '$state', '$timeout', 'events', 'ActivityService',
            function ($scope, $rootScope, $state, $timeout, events, ActivityService) {

                var groups = [
//                    'past',
                    'open',
                    'today',
                    'tomorrow',
                    'week',
                    'month'
                ];

                var groupedEvents = _.groupBy(events, function(event) {

                    var date = event.start;

                    // open events that have past
                    if(event.status === 'open' && moment().diff(date) > 0) {
                        return 'open';
                    }

                    var today = moment().hour(0).minute(0).second(0).millisecond(0);
                    var tomorrow = moment(today).add('days', 1);
                    var dayAfterTomorrow = moment(today).add('days', 2);

                    var nextWeek = moment(today).day(1).add('days', 7);
                    var nextMonth = moment(today).date(1).month((today.month() + 1));
                    var nextYear = moment(today).month(0).date(1).add('years', 1);


                    var eventDate = moment(date);

                    // TODO: filter out events by db query that are not open and in the past

                    if(eventDate.diff(tomorrow) < 0) {
                        return "past";
                    } else if(eventDate.diff(tomorrow) < 0) {
                        return 'today';
                    } else if(eventDate.diff(dayAfterTomorrow) < 0) {
                        return 'tomorrow';
                    } else if(eventDate.diff(nextWeek) < 0) {
                        return 'week';
                    } else if(eventDate.diff(nextMonth) < 0) {
                        return 'month';
                    } else if(eventDate.diff(nextYear) < 0) {
                        var month = eventDate.month();
                        if(!_.contains(groups, month)) {
                            groups.push(month);
                        }
                        return  month;
                    } else {
                        return 'year';
                    }

                });

                groups.push('year');

                $scope.groups = [];
                _.forEach(groups, function (group) {
                    if(groupedEvents[group]) {

                        var events = _.sortBy(groupedEvents[group], function(event) {
                            return event.start;
                        });

                        if(group === 'open') {
                            $scope.openEvents = events.length;
                            events = _.first(events, 2);
                        }

                        $scope.groups.push({
                            name: group,
                            events: events
                        });
                    }
                });

                $scope.getJoiningUsers = function (event) {
                    return _.pluck(event.plan.joiningUsers.slice(1), 'fullname').join('<br/>');
                };

                $scope.inviteEmailToJoinPlan = function (email, activityPlan) {
                    this.inviteEmail = "";

                    ActivityService.inviteEmailToJoinPlan(email, activityPlan).then(function (result) {
                        $rootScope.$emit('clientmsg:success', 'activityPlan.invite', { values: { email: email } });
                        $scope.$broadcast('formPristine');
                    });
                };

                $scope.updateEvent = function(updatedEvent, status) {
                    updatedEvent.status = status;
                    ActivityService.updateActivityEvent(updatedEvent).then(function() {

                        var openEvents = _.find($scope.groups, function(group) {
                            return group.name === 'open';
                        });
                        $scope.openEvents--;
                        _.remove(openEvents.events, function(openEvent) {
                            return openEvent.id === updatedEvent.id;
                        });
                        $rootScope.$emit('clientmsg:success','activityEvent.update');
                    });
                };
            }
        ]);

}());