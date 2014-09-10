(function () {
    'use strict';

    angular.module('yp.dhc')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('dhc.activity', {
                        url: "/idea/:idea/activity/:activity/socialInteraction/:socialInteraction/:mode",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dhc/activity/activity.html',
                                controller: 'ActivityController as activityController'
                            }
                        },
                        resolve: {

                            idea: ['$stateParams', 'ActivityService', function ($stateParams, ActivityService) {
                                var idea = $stateParams.idea;
                                if (!idea) {
                                    throw new Error('activity: stateParam idea is required');
                                }
                                return  ActivityService.getIdea(idea);
                            }],

                            socialInteraction: ['$stateParams', 'SocialInteractionService', function ($stateParams, SocialInteractionService) {
                                if ($stateParams.socialInteraction) {
                                    return  SocialInteractionService.getSocialInteraction($stateParams.socialInteraction);
                                } else {
                                    return undefined;
                                }
                            }],
                            campaignInvitation: ['$stateParams', 'SocialInteractionService', 'activity', function ($stateParams, SocialInteractionService, activity) {
                                return activity.id ? SocialInteractionService.getInvitations({
                                    targetId: $stateParams.campaignId,
                                    refDocId: activity.id
                                }) : undefined;
                            }],
                            invitationStatus: ['$stateParams', 'ActivityService', function ($stateParams, ActivityService) {
                                if ($stateParams.activity) {
                                    return  ActivityService.getInvitationStatus($stateParams.activity);
                                } else {
                                    return [];
                                }
                            }],

                            activity: ['$stateParams', 'ActivityService', 'socialInteraction', '$q',
                                function ($stateParams, ActivityService, socialInteraction, $q) {
                                    // check whether we have a socialInteraction holding an activity
                                    var activityRefDoc = socialInteraction && _.find(socialInteraction.refDocs, function (refDoc) {
                                        return refDoc.doc && refDoc.model === 'Activity';
                                    });
                                    if (activityRefDoc) {
                                        return activityRefDoc.doc;
                                    }
                                if ($stateParams.activity) {
                                    return  ActivityService.getActivity($stateParams.activity);
                                } else {
                                    return ActivityService.getDefaultActivity($stateParams.idea);
                                }
                            }],


                            activityEvents: ['ActivityService', 'activity', function(ActivityService, activity) {

                                if(!activity.id) {
                                    return [];
                                }

                                return ActivityService.getActivityEvents({
                                    'filter[activity]': activity.id,
                                    sort: 'start'
                                });
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/activity/activity');
            }])

        .controller('ActivityController', [ '$scope', '$rootScope', '$state', '$stateParams', '$timeout',
            'UserService', 'ActivityService', 'SocialInteractionService',
            'campaign', 'idea', 'activity', 'activityEvents', 'socialInteraction', 'campaignInvitation', 'invitationStatus',
            function ($scope, $rootScope, $state, $stateParams, $timeout, UserService, ActivityService, SocialInteractionService,
                      campaign, idea, activity, activityEvents, socialInteraction, campaignInvitation, invitationStatus) {


                $scope.idea = idea;
                $scope.activity = activity;
                $scope.socialInteraction = socialInteraction;
                $scope.events = _.filter(activityEvents, { status: 'open'});

                // campaign wide invitation, no individual invitations once the whole campaign was invited -> delete and create new instead
                $scope.campaignInvitation = campaignInvitation;

                $scope.isScheduled = activity && activity.id;

                var mode = $stateParams.mode;
                if (!mode) {
                    if (socialInteraction) {
                        mode = socialInteraction.__t.toLowerCase();
                    } else if ($scope.isScheduled && activity.isOwner()) {
                        mode = 'owned';
                    } else if ($scope.isScheduled && activity.isJoiningUser()) {
                        mode = 'joined';
                    } else {
                        mode = 'schedule';
                    }

                    $stateParams.mode = mode;
                }

                var activityController = this;
                activityController.mode = $scope.mode = mode;

                // only recommendations have to be activated
                activityController.active = !socialInteraction || socialInteraction.__t !== 'Recommendation';
                activityController.formEnabled = (activity.id && activity.isOwner && activity.isOwner()) ||
                    mode === 'recommendation' ||
                    mode === 'campaignlead' ||
                    mode === 'schedule';
                activityController.formActive = mode === 'schedule' || mode === 'campaignlead';


                if(campaignInvitation || mode === 'campaignlead') { // check if campaign is already invited
                    $scope.inviteOthers = 'all';
                    $scope.inviteLocked = true;
                }
                $scope.invitedUsers = [];
                if(invitationStatus && invitationStatus.length > 0) {
                    $scope.inviteOthers = 'selected';
                    _.each(invitationStatus, function (status) {
                        var user = status.user || status.email;
                        user.invitationStatus = status.status;
                        $scope.invitedUsers.push(user);
                    });
                }

                $scope.usersExcludedForInvitation = $scope.invitedUsers.concat($scope.activity.owner);

                $scope.usersToBeInvited = [];
                $scope.onUserSelected = function onUserSelected(selection) {

                    if(activityController.inviteByEmail) {
                        activityController.inviteByEmail = false;
                        $scope.usersToBeInvited.push(selection);
                    } else {
                        $scope.usersToBeInvited.push(selection);
                        $scope.usersExcludedForInvitation.push(selection);
                    }
                };
                $scope.removeUserToBeInvited = function (user) {
                    _.remove($scope.usersToBeInvited, user.id ? { id: user.id } : user);
                };

                var validateActivity = _.debounce(function (mainEvent, old) {

                    if(!old || _.isEqual(mainEvent, old)) {
                        return;
                    }

                    ActivityService.validateActivity($scope.activity).then(function (activityValidationResults) {

                        $scope.events = [];
                        _.forEach(activityValidationResults, function (result) {
                            var event = result.event;

                            event.activity = $scope.activity;
                            event.conflictingEvent = result.conflictingEvent;

                            $scope.events.push(event);

                        });

                    });
                }, 200);


                $scope.$watch('activity.mainEvent', validateActivity, true);
                $scope.$watch('activity', function (val, old) {
                    $scope.dirty = true;
                    console.log('dirty');
                }, true);

                $timeout(function () {
                    $scope.dirty  = activityController.formActive && !activity.id;
                });

                $scope.backToGame = function() {
                    if(mode === 'campaignlead') {
                        $state.go('dcm.home');
                    } else {
                        $state.go('dhc.game');
                    }
                }

                $scope.dismiss = function dismiss() {
                    SocialInteractionService.deleteSocialInteraction($scope.socialInteraction.id, { reason: 'denied'}).then(function (result) {
                        console.log(result);
                        activityController.dismissed = true;
                    });

                };

                $scope.submit = function() {
                    var user = UserService.principal.getUser();
                    if( ($scope.activity.owner.id || $scope.activity.owner) === user.id) {
                        $scope.saveActivity();
                    } else {
                        $scope.joinActivity();
                    }
                };

                $scope.deleteActivity = function deleteActivity() {
                    ActivityService.deleteActivity($scope.activity.id)
                        .then(function () {
                            $rootScope.$emit('clientmsg:success', 'activity.deleted');
                            $state.go('dhc.game');
                        });
                };
                $scope.joinActivity = function joinActivity() {
                    ActivityService.joinPlan($scope.activity).then(function (joinedActivity) {
                        $rootScope.$emit('clientmsg:success', 'activity.joined');
                        $state.go('dhc.activity', { idea: idea.id, activity: joinedActivity.id, socialInteraction: undefined });
                    });
                };
                $scope.saveActivity = function saveActivity() {

                    ActivityService.savePlan($scope.activity).then(function (savedActivity) {
                        $rootScope.$emit('clientmsg:success', 'activity.saved');

                        $scope.activity = savedActivity;
                        $scope.dirty = false;

                        var inviteAll = $scope.inviteOthers === 'all';
                        if (inviteAll || $scope.usersToBeInvited.length > 0) {

                            var invitation = {
                                author: UserService.principal.getUser().id,
                                authorType: mode === 'campaignlead' ? 'campaignLead' : 'user',
                                refDocs: [
                                    {
                                        docId: $scope.activity.id,
                                        model: 'Activity'
                                    }
                                ]
                            };

                            var newActivity = !activity.id;

                            if (inviteAll && newActivity) {
                                invitation.targetSpaces = [
                                    {
                                        type: 'campaign',
                                        targetId: campaign.id
                                    }
                                ];

                                SocialInteractionService.postInvitation(invitation);

                            } else if(!inviteAll) {

                                var toBeInvited = _.groupBy($scope.usersToBeInvited, function(user) {
                                    return typeof user;
                                });

                                var users = toBeInvited.object;
                                var emails = toBeInvited.string;

                                invitation.targetSpaces = [];
                                _.forEach(users, function (user) {
                                    invitation.targetSpaces.push({
                                        type: 'user',
                                        targetId: user.id
                                    });
                                });

                                SocialInteractionService.postInvitation(invitation);

                                if(emails.length > 0) {
                                    ActivityService.inviteEmailToJoinPlan(emails.join(' '), savedActivity);
                                }
                            }

                        }

                        $state.go('dhc.activity', { idea: idea.id, activity: savedActivity.id, socialInteraction: undefined });
                    });


                };
            }
        ]);

}());