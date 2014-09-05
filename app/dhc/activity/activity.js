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
                                return ActivityService.getActivityEvents({
                                    'filter[activity]': activity.id
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
                    }

                    $stateParams.mode = mode;
                }

                var activityController = this;
                activityController.mode = $scope.mode = mode;

                // only recommendations have to be activated
                activityController.active = !socialInteraction || socialInteraction.__t !== 'Recommendation';
                activityController.formEnabled = activity.id && activity.isOwner && activity.isOwner() || mode === 'recommendation';


                if(campaignInvitation) { // check if campaign is already invited
                    $scope.inviteOthers = 'all';
                    $scope.inviteLocked = true;
                }
                $scope.invitedUsers = [];
                if(invitationStatus && invitationStatus.length > 0) {
                    $scope.inviteOthers = 'selected';
                    _.each(invitationStatus, function (status) {
                        var user = status.user;
                        user.invitationStatus = status.status;
                        $scope.invitedUsers.push(user);
                    });
                }

                $scope.usersExcludedForInvitation = $scope.invitedUsers.concat($scope.activity.owner);

                $scope.usersToBeInvited = [];
                $scope.onUserSelected = function onUserSelected(user) {

                    if(activityController.inviteByEmail) {
                        activityController.inviteByEmail = false;
                        $scope.invitedUsers.push(user);
                    } else {
                        $scope.usersToBeInvited.push(user);
                        $scope.usersExcludedForInvitation.push(user);
                    }
                };
                $scope.removeUserToBeInvited = function (user) {
                    _.remove($scope.usersToBeInvited, { id: user.id });
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
                    $scope.dirty  = mode === 'recommendation';
                });


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
                    ActivityService.deleteActivity($scope.activity.id);
                    $rootScope.$emit('clientmsg:success', 'activity.deleted');
                    $state.go('dhc.game');
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
                        $state.go('dhc.activity', { idea: idea.id, activity: savedActivity.id, socialInteraction: undefined });

                        var inviteAll = $scope.inviteOthers === 'all';
                        if (inviteAll || $scope.usersToBeInvited.length > 0) {

                            var invitation = {
                                author: UserService.principal.getUser().id,
                                refDocs: [
                                    {
                                        docId: $scope.activity.id,
                                        model: 'Activity'
                                    }
                                ]
                            };

                            if (inviteAll) {
                                invitation.targetSpaces = [
                                    {
                                        type: 'campaign',
                                        targetId: campaign.id
                                    }
                                ];
                            } else {
                                invitation.targetSpaces = [];
                                _.forEach($scope.usersToBeInvited, function (user) {
                                    invitation.targetSpaces.push({
                                        type: 'user',
                                        targetId: user.id
                                    });
                                });
                            }

                            SocialInteractionService.postInvitation(invitation);
                        }

                    });


                };
            }
        ]);

}());