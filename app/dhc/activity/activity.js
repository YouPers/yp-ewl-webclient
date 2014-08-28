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
                            invitations: ['$stateParams', 'SocialInteractionService', function ($stateParams, SocialInteractionService) {
                                if ($stateParams.activity) {

                                    return  SocialInteractionService.getInvitations({
                                        refDocId: $stateParams.activity,
                                        dismissed: true,
                                        authored: true
                                    });
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
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/activity/activity');
            }])

        .controller('ActivityController', [ '$scope', '$rootScope', '$state', '$stateParams',
            'UserService', 'ActivityService', 'SocialInteractionService',
            'campaign', 'idea', 'activity', 'socialInteraction', 'invitations',
            function ($scope, $rootScope, $state, $stateParams, UserService, ActivityService, SocialInteractionService, campaign, idea, activity, socialInteraction, invitations) {

                var activityController = this;

                $scope.idea = idea;
                $scope.activity = activity;

                if (socialInteraction) {
                    $scope.socialInteraction = socialInteraction;
                    $scope.socialInteractionEvent = activity ? _.clone(activity.mainEvent) : {};
                    _.extend($scope.socialInteractionEvent, {
                        idea: idea,
                        socialInteraction: socialInteraction
                    });
                }


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
                $scope.mode = mode;

                $scope.canEdit = {
                    'schedule': true,
                    'recommendation': true,
                    'invitation': false,
                    'joined': false,
                    'owned': true
                };
                $scope.canDismiss = {
                    'schedule': false,
                    'recommendation': true,
                    'invitation': true,
                    'joined': false,
                    'owned': false
                };

                $scope.invitedUsers = activity.joiningUsers || [];

                _.forEach($scope.invitedUsers, function(user) {
                    user.invitationStatus = 'accepted';
                });

                _.forEach(_.flatten(invitations, 'targetSpaces'), function (space) {
                    if(space.type === 'campaign' && space.targetId === activity.campaign) { //check if campaign is invited
                        $scope.inviteOthers = 'all';
                        $scope.inviteLocked = true;
                    } else if(space.type === 'user') { // extract invited users
                        $scope.inviteOthers = 'selected';
                        var user = space.user;
                        user.invitationStatus = user.dismissed || user.rejected ? 'rejected' : 'pending';
                        $scope.invitedUsers.push(user);
                    }
                });

                $scope.usersExcludedForInvitation = $scope.invitedUsers.concat($scope.activity.owner);

                $scope.usersToBeInvited = [];
                $scope.onUserSelected = function onUserSelected(user) {
                    $scope.usersToBeInvited.push(user);
                };
                $scope.removeUserToBeInvited = function (user) {
                    _.remove($scope.usersToBeInvited, { id: user.id });
                };

                var validateActivity = _.debounce(function () {
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
                $scope.$watch('activity', function () {
                    $scope.dirty = true;
                }, true);

                $scope.dismiss = function dismiss() {
                    SocialInteractionService.deleteSocialInteraction($scope.socialInteraction.id, { reason: 'denied'}).then(function (result) {
                        console.log(result);
                        activityController.dismissed = true;
                    });

                };
                $scope.saveActivity = function saveActivity() {

                    ActivityService.savePlan($scope.activity).then(function (savedActivity) {
                        $rootScope.$emit('clientmsg:success', 'activityPlan.save');

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