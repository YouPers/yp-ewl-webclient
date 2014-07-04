(function () {
    'use strict';

    angular.module('yp.dhc')

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
                            idea: ['$stateParams', 'ActivityService', function ( $stateParams, ActivityService){
                                return ActivityService.getIdea($stateParams.id);
                            }],
                            invitations: ['$stateParams', 'SocialInteractionService', function ( $stateParams, SocialInteractionService){
                                return SocialInteractionService.getInvitations({populate: 'activity'});
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
                            schedule: ['$rootScope', '$stateParams', 'ActivityService', function ($rootScope, $stateParams, ActivityService) {
                                return ActivityService.getActivityPlan($stateParams.id).then(function(plan) {


                                    return {

                                        isScheduled: true,
                                        isDeletable: plan.deleteStatus.indexOf('deletable') === 0,
                                        isEditable: plan.editStatus === 'editable',
                                        isJoinedPlan: plan.owner.id === $rootScope.principal.getUser().id,
                                        idea: plan.idea,
                                        plan: plan,
                                        recommendedBy: plan.invitedBy
                                    };
                                });
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/schedule/schedule');
            }])

        .controller('ScheduleController', [ '$scope', '$rootScope', '$state', '$stateParams', '$location', '$timeout', 'idea', 'invitations','ActivityService',
            function ($scope, $rootScope, $state, $stateParams, $location, $timeout, idea, invitations, ActivityService) {

                var schedule = {
                    idea: idea,
                    plan: ActivityService.getDefaultPlan(idea)
                };

                $scope.schedule = schedule;
                $scope.plan = schedule.plan;
                $scope.schedule.executionType = schedule.plan.executionType;

// TODO: WL-825 will remove this, and
//                if($stateParams.event) {
//                    var offset = _.findIndex($scope.plan.events, function(event) {
//                        return $stateParams.event === event.id;
//                    });
//                    $location.search({ offset: offset });
//                }

                // execution type / visibility mapping, to be continued in saveActivityPlan()
                if($scope.schedule.idea.defaultexecutiontype === 'self') {
                    $scope.schedule.isPrivate = true; // flag for ui
                    $scope.plan.visibility = false; // checkbox model
                } else {
                    $scope.schedule.isPrivate = false;
                    $scope.plan.visibility = true;
                }

                $scope.getJoiningUsers = function (plan) {
                    return _.pluck(plan.joiningUsers.slice(1), 'fullname').join('<br/>');
                };

                var _getConflictsDebounced = _.debounce(function(plan) {
                    ActivityService.getSchedulingConflicts($scope.plan).then(function(conflicts) {
                        if (conflicts.length > 0) {
                            $rootScope.$emit('healthCoach:displayMessage',
                                "hcmsg.schedulingConflict",
                                {beginDate: moment(conflicts[0].conflictingSavedEvent.begin).format("dd DD.MM.YYYY HH:mm"),
                                endDate: moment(conflicts[0].conflictingSavedEvent.end).format("HH:mm"),
                                title: conflicts[0].conflictingSavedEvent.title});
                        }
                    });
                }, 1000);

                $scope.$watch('plan.mainEvent',_getConflictsDebounced, true);

// TODO: WL-825, remove this as soon as we are sure that there will be no more feedback no schedule page

//                $scope.isFutureEvent = function(event) {
//                    return moment().diff(event.start) < 0;
//                };
//
//                // setup the automatic saving of Feedback
//
//
//                _.forEach($scope.plan.events, function(event, index) {
//                    var updateEvent = function updateEvent(newEvent, oldEvent) {
//                        if(newEvent && !_.isEqual(newEvent, oldEvent) && !$scope.isFutureEvent(newEvent)) {
//                            ActivityService.updateActivityEvent(newEvent).then(function() {
//                                $rootScope.$emit('clientmsg:success','activityPlan.eventSaved');
//                            });
//                        }
//                    };
//                    $scope.$watch('plan.events[' + index + ']', _.debounce(updateEvent, 1000), true);
//                });

                //TODO: update ui while dirty / not saved

                $scope.inviteEmailToJoinPlan = function (email, activityPlan) {
                    $scope.inviteEmail = "";
                    ActivityService.inviteEmailToJoinPlan(email, activityPlan).then(function (result) {
                        $rootScope.$emit('clientmsg:success', 'activityPlan.invite', { values: { email: email } });
                        $scope.$broadcast('formPristine');
                    });
                };

                $scope.joinActivityPlan = function(plan) {
                    ActivityService.joinPlan(plan).then(function(joinedPlan) {
                        $rootScope.$emit('clientmsg:success', 'activityPlan.join');
                        $state.go('schedule.plan', { id: joinedPlan.id });
                    });
                };


                $scope.saveActivityPlan = function() {

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

                    }, function(err) {
                        $rootScope.$emit('clientmsg:error', err);
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