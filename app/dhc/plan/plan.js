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
                                        'populate': [ 'idea activity'],
                                        'populatedeep': ['activity.owner activity.joiningUsers']
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


                    // open events that have passed are put into the group 'open'
                    if(event.status === 'open' && moment().diff(event.end) > 0) {
                        return 'open';
                    }

                    var today = moment().hour(0).minute(0).second(0).millisecond(0);
                    var tomorrow = moment(today).add('days', 1);
                    var dayAfterTomorrow = moment(today).add('days', 2);

                    var nextWeek = moment(today).day(1).add('days', 7);
                    var nextMonth = moment(today).date(1).month((today.month() + 1));
                    var nextYear = moment(today).month(0).date(1).add('years', 1);


                    var eventEndDate = moment(event.end);

                    // TODO: filter out events by db query that are not open and in the past

                    if(eventEndDate.diff(tomorrow) < 0) {
                        return "past";
                    } else if(eventEndDate.diff(tomorrow) < 0) {
                        return 'today';
                    } else if(eventEndDate.diff(dayAfterTomorrow) < 0) {
                        return 'tomorrow';
                    } else if(eventEndDate.diff(nextWeek) < 0) {
                        return 'week';
                    } else if(eventEndDate.diff(nextMonth) < 0) {
                        return 'month';
                    } else if(eventEndDate.diff(nextYear) < 0) {
                        var month = eventEndDate.month();
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
                            $scope.groups.openEvents = events.length;
                        }

                        $scope.groups.push({
                            name: group,
                            events: events
                        });
                    }
                });

                $scope.getJoiningUsers = function (event) {
                    return _.pluck(event.activity.joiningUsers.slice(1), 'fullname').join('<br/>');
                };

                $scope.inviteEmailToJoinPlan = function (email, activity) {
                    this.inviteEmail = "";

                    ActivityService.inviteEmailToJoinPlan(email, activity).then(function (result) {
                        $rootScope.$emit('clientmsg:success', 'activity.invite', { values: { email: email } });
                        $scope.$broadcast('formPristine');
                    });
                };

                $scope.updateEvent = function(updatedEvent, status) {
                    updatedEvent.status = status;
                    ActivityService.updateActivityEvent(updatedEvent).then(function() {

                        var openEventsGroup = _.find($scope.groups, function(group) {
                            return group.name === 'open';
                        });

                        _.remove(openEventsGroup.events, function(openEvent) {
                            return openEvent.id === updatedEvent.id;
                        });
                        $scope.groups.openEvents--;
                        $rootScope.$emit('clientmsg:success','activityEvent.update');
                    });
                };
            }
        ]);

}());