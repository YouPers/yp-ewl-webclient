(function () {
    'use strict';

    angular.module('yp.dhc.schedule',
        [
            'restangular',
            'ui.router'
        ])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('schedule', {
                        templateUrl: "layout/default.html",
                        access: accessLevels.all
                    })
                    .state('schedule.offer', {
                        url: "/schedule/:id",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dhc/schedule/schedule.html',
                                controller: 'ScheduleController'
                            }
                        },
                        resolve: {
                            schedule: ['$stateParams', 'ActivityService', function ($stateParams, ActivityService) {
                                return ActivityService.getActivityOffer($stateParams.id).then(function(offer) {
                                    offer.plan = ActivityService.getDefaultPlan(offer.activity);
                                    offer.isScheduled = false;

                                    return offer;
                                });
                            }]
                        }
                    })
                    .state('schedule.plan', {
                        url: "/plan/:id",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dhc/schedule/schedule.html',
                                controller: 'ScheduleController'
                            }
                        },
                        resolve: {
                            schedule: ['$stateParams', 'ActivityService', function ($stateParams, ActivityService) {
                                return ActivityService.getActivityPlan($stateParams.id).then(function(plan) {
                                    return {

                                        isScheduled: true,
                                        isDeletable: plan.deleteStatus.indexOf('deletable') === 0,
                                        isEditable: plan.editStatus === 'editable',
                                        isJoinedPlan: !!plan.masterPlan,

                                        activity: plan.activity,
                                        plan: plan,
                                        recommendedBy: plan.invitedBy
                                    };
                                });
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/schedule/schedule');
            }])

        .controller('ScheduleController', [ '$scope', '$rootScope', '$state', '$timeout', 'schedule', 'ActivityService',
            function ($scope, $rootScope, $state, $timeout, schedule, ActivityService) {

                $scope.schedule = schedule;
                $scope.plan = schedule.plan;


                // execution type / visibility mapping, to be continued in saveActivityPlan()
                if($scope.schedule.activity.defaultexecutiontype === 'self') {
                    $scope.schedule.isPrivate = true; // flag for ui
                    $scope.plan.visibility = false; // checkbox model
                } else {
                    $scope.schedule.isPrivate = false;
                    $scope.plan.visibility = true;
                }

                $scope.getJoiningUsers = function () {
                    return _.pluck(schedule.plan.joiningUsers, 'fullname').join('\n');
                };

                // calendar & recurrence


                // one time planning using daypicker
                $scope.showWeeks = false;
                $scope.minDate = new Date();

                $scope.dateOptions = {
                    'year-format': "'yy'",
                    'starting-day': 1
                };

                // weekplanning using dayselector
                $scope.availableDays = [
                    {label: 'weekday.monday', value: "1"},
                    {label: 'weekday.tuesday', value: "2"},
                    {label: 'weekday.wednesday', value: "3"},
                    {label: 'weekday.thursday', value: "4"},
                    {label: 'weekday.friday', value: "5"},
                    {label: 'weekday.saturday', value: "6"},
                    {label: 'weekday.sunday', value: "0"}
                ];

                function nextWeekday(date, weekday) {
                    if (!weekday) {
                        return date;
                    }
                    var input = moment(date);
                    var output = input.day(weekday);
                    return output > moment(date) ? output.toDate() : output.add('week', 1).toDate();
                }

                $scope.$watch('plan.weeklyDay', function (newValue, oldValue) {
                    if (newValue && $scope.currentActivityPlan.mainEvent.frequency === 'week') {
                        var duration = $scope.currentActivityPlan.mainEvent.end - $scope.currentActivityPlan.mainEvent.start;
                        $scope.currentActivityPlan.mainEvent.start = nextWeekday(new Date(), newValue);
                        $scope.currentActivityPlan.mainEvent.end = moment($scope.currentActivityPlan.mainEvent.start).add(duration);
                    }
                });

                _.forEach($scope.plan.events, function(event, index) {
                    var updateEvent = function updateEvent(newEvent, oldEvent) {
                        if(newEvent && !_.isEqual(newEvent, oldEvent)) {
                            ActivityService.updateActivityEvent($scope.plan.id, newEvent);
                        }
                    };
                    $scope.$watch('plan.events[' + index + ']', _.throttle(updateEvent, 1000), true);
                });

                //TODO: update ui while dirty / not saved

                $scope.inviteEmailToJoinPlan = function (email, activityPlan) {
                    $scope.inviteEmail = "";
                    $scope.$broadcast('formPristine');
                    ActivityService.inviteEmailToJoinPlan(email, activityPlan).then(function (result) {
                        $rootScope.$emit('notification:success', 'activityPlan.invite', { values: { email: email } });
                    });
                };

                $scope.joinActivityPlan = function(plan) {
                    ActivityService.joinPlan(plan).then(function(joinedPlan) {
                        $rootScope.$emit('notification:success', 'activityPlan.join');
                        $state.go('schedule.plan', { id: joinedPlan.id });
                    });
                };


                $scope.saveActivityPlan = function() {

                    // currently start and end day is the same as only one date can be entered
                    // hack to ensure
                    // - that start and end is on the same day
                    var dateStart = new Date($scope.plan.mainEvent.start);
                    var dateEnd = new Date($scope.plan.mainEvent.end);
                    dateEnd.setYear(dateStart.getFullYear());
                    dateEnd.setMonth(dateStart.getMonth());
                    dateEnd.setDate(dateStart.getDate());
                    $scope.plan.mainEvent.end = dateEnd;

                    if($scope.plan.visibility) {
                        $scope.plan.visibility = 'campaign';
                        $scope.plan.executionType = 'group';
                    } else {
                        $scope.plan.visibility = 'private';
                        $scope.plan.executionType = 'self';
                    }

                    ActivityService.savePlan($scope.plan).then(function (savedPlan) {
                        $rootScope.$emit('notification:success', 'activityPlan.save');

                        // if a campaign activity Plan has been created, send sample invite to the author
                        var user = $scope.principal.getUser();
                        if (_.contains(user.roles, 'campaignlead') && savedPlan.source === 'campaign') {
                            $scope.$broadcast('formPristine');
                            ActivityService.inviteEmailToJoinPlan(user.email, savedPlan).then(function (result) {
                                $rootScope.$emit('notification:success', 'activityPlan.sampleInvitationSent', { values: { email: user.email }});
                            });
                        }

                        $scope.plan = savedPlan;
                        $state.go('schedule.plan', { id: savedPlan.id });

                    });
                };

                $scope.deleteActivityPlan = function () {
                    ActivityService.deletePlan($scope.plan).then(function (result) {
                        $rootScope.$emit('notification:success', 'activityPlan.delete');
                        // TODO: define where to go and do it.
                        $rootScope.back();
                    });
                };
            }
        ]);

}());