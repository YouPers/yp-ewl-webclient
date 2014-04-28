(function () {
    'use strict';

    angular.module('yp.dhc.plan',
        [
            'restangular',
            'ui.router'
        ])

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
                            plans: ['$stateParams', 'ActivityService', function ($stateParams, ActivityService) {
                                return ActivityService.getActivityPlans({'populate': ['owner', 'invitedBy', 'joiningUsers', 'activity']});
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/plan/plan');
            }])

        .controller('PlanController', [ '$scope', '$rootScope', '$state', '$timeout', 'plans', 'ActivityService',
            function ($scope, $rootScope, $state, $timeout, plans, ActivityService) {

                var events = [];

                var groups = [
                    'open',
                    'today',
                    'tomorrow',
                    'week',
                    'month'
                ];

                _.forEach(plans, function(plan) {
                    _.forEach(plan.events, function(event) {
                        event.plan = plan;
                        events.push(event);
                    });
                });

                var groupedEvents = _.groupBy(events, function(event) {

                    var date = event.begin;

                    // open events that have past
                    if(event.status === 'open' && moment().diff(date) > 0) {
                        return 'open';
                    }

                    var now = moment();

                    var today = moment().hour(0).minute(0).second(0).millisecond(0);
                    var tomorrow = moment(today).add('days', 1);
                    var dayAfterTomorrow = moment(today).add('days', 2);

                    var nextWeek = moment(today).day(7);
                    var nextMonth = moment(today).date(1).month((today.month() + 1) % 11);


                    var eventDate = moment(date);

                    // TODO: finetune today/tomorrow

                    if(eventDate.diff(tomorrow) < 0) {
                        return 'today';
                    } else if(eventDate.diff(dayAfterTomorrow) < 0) {
                        return 'tomorrow';
                    } else if(eventDate.diff(nextWeek) < 0) {
                        return 'week';
                    } else if(eventDate.diff(nextMonth) < 0) {
                        return 'month';
                    } else {
                        var month = eventDate.month();
                        if(!_.contains(groups, month)) {
                            groups.push(month);
                        }
                        return  month;
                    }

                });


                if(groupedEvents.open) {

                }

                $scope.groups = [];
                _.forEach(groups, function (group) {
                    if(groupedEvents[group]) {

                        var events = _.sortBy(groupedEvents[group], function(event) {
                            return event.begin;
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

                $scope.updateEvent = function(event, status) {
                    var planId = event.plan.id;
                    delete event.plan;
                    event.status = status;
                    ActivityService.updateActivityEvent(planId, event).then(function() {
                        $state.go('schedule.plan', {
                            id: planId,
                            event: event.id
                        });
                    });
                };
            }
        ]);

}());