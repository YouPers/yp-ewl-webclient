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
                        access: accessLevels.user
                    })
                    .state('schedule.offer', {
                        url: "/schedule/:id",
                        access: accessLevels.user,
                        views: {
                            content: {
                                templateUrl: 'dhc/schedule/schedule.html',
                                controller: 'ScheduleController'
                            }
                        },
                        resolve: {
                            schedule: ['$stateParams', 'ActivityService', function ($stateParams, ActivityService) {
                                return ActivityService.getActivityOffers({activity: $stateParams.id}).then(function(offers) {
                                    if (offers.length === 1) {
                                        var offer = offers[0];
                                        offer.plan = ActivityService.getDefaultPlan(offer.activity);
                                        offer.isScheduled = false;
                                        return offer;
                                    } else if (offers.length === 0) {
                                        return [];
                                        // TODO: What should we do if we arrive here without offers

                                    } else {
                                        // this should never happen
                                        throw new Error("should never get more than one offer for one activity");
                                    }
                                });
                            }]
                        }
                    })
                    .state('schedule.plan', {
                        url: "/plan/:id/:event/",
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

        .controller('ScheduleController', [ '$scope', '$rootScope', '$state', '$stateParams', '$location', '$timeout', 'schedule', 'ActivityService',
            function ($scope, $rootScope, $state, $stateParams, $location, $timeout, schedule, ActivityService) {

                $scope.schedule = schedule;
                $scope.plan = schedule.plan;

                $scope.$watch('plan.mainEvent.start', function(val, old) {
                    if(old !== val) {
                        var end = moment($scope.plan.mainEvent.end).add(moment(val).diff(old));
                        $scope.plan.mainEvent.end = old ? end : val;
                    }
                });


                if($stateParams.event) {
                    var offset = _.findIndex($scope.plan.events, function(event) {
                        return $stateParams.event === event.id;
                    });
                    $location.search({ offset: offset });
                }

                // execution type / visibility mapping, to be continued in saveActivityPlan()
                if($scope.schedule.activity.defaultexecutiontype === 'self') {
                    $scope.schedule.isPrivate = true; // flag for ui
                    $scope.plan.visibility = false; // checkbox model
                } else {
                    $scope.schedule.isPrivate = false;
                    $scope.plan.visibility = true;
                }

                $scope.getJoiningUsers = function (plan) {
                    return _.pluck(plan.joiningUsers.slice(1), 'fullname').join('<br/>');
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

                $scope.isFutureEvent = function(event) {
                    return moment().diff(event.begin) < 0;
                };

                _.forEach($scope.plan.events, function(event, index) {
                    var updateEvent = function updateEvent(newEvent, oldEvent) {
                        if(newEvent && !_.isEqual(newEvent, oldEvent) && !$scope.isFutureEvent(newEvent)) {
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
                        $rootScope.$emit('clientmsg:success', 'activityPlan.invite', { values: { email: email } });
                    });
                };

                $scope.joinActivityPlan = function(plan) {
                    ActivityService.joinPlan(plan).then(function(joinedPlan) {
                        $rootScope.$emit('clientmsg:success', 'activityPlan.join');
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

                    // TODO: validate/set source = ['campaign', 'community'] if user is a campaign lead

                    ActivityService.savePlan($scope.plan).then(function (savedPlan) {
                        $rootScope.$emit('clientmsg:success', 'activityPlan.save');

                        // if a campaign activity Plan has been created, send sample invite to the author
                        var user = $scope.principal.getUser();
                        if (_.contains(user.roles, 'campaignlead') && savedPlan.source === 'campaign') {
                            $scope.$broadcast('formPristine');
                            ActivityService.inviteEmailToJoinPlan(user.email, savedPlan).then(function (result) {
                                $rootScope.$emit('clientmsg:success', 'activityPlan.sampleInvitationSent', { values: { email: user.email }});
                            });
                        }

                        $scope.plan = savedPlan;
                        $state.go('schedule.plan', { id: savedPlan.id });

                    });
                };

                $scope.deleteActivityPlan = function () {
                    ActivityService.deletePlan($scope.plan).then(function (result) {
                        $rootScope.$emit('clientmsg:success', 'activityPlan.delete');
                        // TODO: define where to go and do it.
                        $rootScope.back();
                    });
                };
            }
        ]);

}());