(function () {
    'use strict';

    angular.module('yp.components.activity', ['yp.components.user'])

        .config(['$translateWtiPartialLoaderProvider',
            function ($translateWtiPartialLoaderProvider) {
                $translateWtiPartialLoaderProvider.addPart('components/activity/activity');
            }])

        .constant('activityResolveConfiguration', {

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
                    refDocId: activity.id,
                    authored: true
                }).then(function (invitations) {
                    return invitations.length > 0 ? invitations[0] : undefined;
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
                        return ActivityService.getDefaultActivity($stateParams.idea, { campaignId: $stateParams.campaignId });
                    }
                }],


            activityEvents: ['ActivityService', 'activity', function (ActivityService, activity) {

                if (!activity.id) {
                    return [];
                }

                return ActivityService.getActivityEvents({
                    'filter[activity]': activity.id,
                    sort: 'start'
                });
            }],

            healthCoachEvent: ['$state', 'campaign', 'socialInteraction',
                function ($state, campaign, socialInteraction) {

                    if(!campaign) {
                        return;
                    }

                    function getEventName() {

                        // workaround until we find a fix to have 2 distinct activity states with a dhc/dcm parent
                        if($state.$current.parent && $state.$current.parent.toString() === 'dhc') { // dhc

                            if(socialInteraction && socialInteraction.__t === 'Recommendation') {
                                return 'scheduleRecommendedActivity';
                            } else {
                                return 'stateEnter';
                            }



                        } else { // dcm

                            return 'stateEnter';
                        }

                    }

                    return getEventName();

                }]
        })


        .controller('ActivityController', [ '$scope', '$rootScope', '$state', '$stateParams', '$timeout',
            'UserService', 'ActivityService', 'SocialInteractionService', 'HealthCoachService',
            'healthCoachEvent', // this resolve is from dhc or dcm activity state
            'campaign', 'idea', 'activity', 'activityEvents', 'socialInteraction', 'campaignInvitation', 'invitationStatus',
            function ($scope, $rootScope, $state, $stateParams, $timeout,
                      UserService, ActivityService, SocialInteractionService, HealthCoachService, healthCoachEvent,
                      campaign, idea, activity, activityEvents, socialInteraction, campaignInvitation, invitationStatus) {


                $scope.healthCoachEvent = healthCoachEvent;
                $scope.campaign = campaign;
                $scope.idea = idea;
                $scope.activity = activity;
                $scope.socialInteraction = socialInteraction;
                $scope.events = _.filter(activityEvents, { status: 'open'});

                // campaign wide invitation, no individual invitations once the whole campaign was invited -> delete and create new instead
                $scope.campaignInvitation = campaignInvitation;

                $scope.isScheduled = activity && activity.id;

                var mode;

                if($state.$current.parent.name === 'dcm') {
                    mode = 'campaignlead';
                } else if (socialInteraction) {
                    mode = socialInteraction.__t.toLowerCase();
                } else if ($scope.isScheduled && activity.isOwner()) {
                    mode = 'owned';
                } else if ($scope.isScheduled && activity.isJoiningUser()) {
                    mode = 'joined';
                } else {
                    mode = 'schedule';
                }

                var activityController = this;
                activityController.mode = $scope.mode = mode;

                // only recommendations have to be activated
                activityController.active = !socialInteraction || socialInteraction.__t !== 'Recommendation';
                activityController.formEnabled = (activity.id && activity.isOwner && activity.isOwner()) ||
                    mode === 'recommendation' ||
                    mode === 'campaignlead' ||
                    mode === 'schedule';
                activityController.formActive = mode === 'schedule' || (mode === 'campaignlead' && !activity.id);

                // invitations

                var invitation = {
                    author: UserService.principal.getUser(),
                    authorType: mode === 'campaignlead' ? 'campaignLead' : 'user',
                    __t: 'Invitation',

                    publishFrom: moment().startOf('day').toDate(),
                    publishTo: moment().endOf('day').toDate()
                };

                if(mode === 'campaignlead') {
                    $scope.socialInteraction = campaignInvitation || invitation;

                    $scope.$watch('socialInteraction.publishFrom', function (date) {
                        var si = $scope.socialInteraction;
                        if(moment(si.publishFrom).isAfter(moment(si.publishTo))) {
                            si.publishTo = moment(si.publishFrom).startOf('end').toString();
                        }
                    });
                    $scope.$watch('socialInteraction.publishTo', function (date) {
                        var si = $scope.socialInteraction;
                        if(moment(si.publishFrom).isAfter(moment(si.publishTo))) {
                            si.publishFrom = moment(si.publishTo).startOf('day').toString();
                        }
                    });
                }


                // user, email & campaign wide selections

                if (campaignInvitation || mode === 'campaignlead') { // check if campaign is already invited
                    activityController.inviteOthers = 'all';
                    $scope.inviteLocked = true;
                }
                $scope.invitedUsers = [];
                if (invitationStatus && invitationStatus.length > 0) {
                    activityController.inviteOthers = 'selected';
                    _.each(invitationStatus, function (status) {
                        var user = status.user || status.email;
                        user.invitationStatus = status.status;
                        $scope.invitedUsers.push(user);
                    });
                }

                // exclude all already invited users, me as the owner, and all campaignLeads from this campaign
                $scope.usersExcludedForInvitation = $scope.invitedUsers.concat($scope.activity.owner).concat(campaign.campaignLeads);

                $scope.usersToBeInvited = [];
                $scope.onUserSelected = function onUserSelected(selection) {
                    $scope.usersToBeInvited.push(selection);
                    $scope.usersExcludedForInvitation.push(selection);
                };
                $scope.onEmailSelected = function onEmailSelected(selection) {
                    $scope.usersToBeInvited.push(selection);
                    $scope.emailToBeInvited = "";
                };
                $scope.removeUserToBeInvited = function (user) {
                    _.remove($scope.usersToBeInvited, user.id ? { id: user.id } : user);
                };

                var validateActivity = _.debounce(function (mainEvent, old) {

                    // cancel if mainEvent did not change, and the activity is not new
                    if (_.isEqual(mainEvent, old) && $scope.isScheduled && $scope.events.length > 0) {
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

                var initialized = false;
                activityController.submitMode = 'Save';

                function dirtyWatch(val, old) {
                    if(initialized) {
                        activityController.dirty = true;

                        if((!activity.id  && activityController.inviteOthers === 'all') ||
                            $scope.usersToBeInvited.length > 0) {
                            activityController.submitMode = 'SaveAndInvite';
                        } else {
                            activityController.submitMode = 'Save';
                        }
                    }
                }
                activityController.dirty = activityController.formActive && !activity.id;

                $scope.$watch('activityController.inviteOthers', dirtyWatch);
                $scope.$watch('usersToBeInvited', dirtyWatch, true);
                $scope.$watch('activity', dirtyWatch, true);
                $scope.$watch('socialInteraction', dirtyWatch, true);

                $timeout(function () {
                    initialized = true;
                });

                $scope.backToGame = function () {
                    if (mode === 'campaignlead') {
                        HealthCoachService.queueEvent('invitationCreated');
                        $state.go('dcm.home');
                    } else {
                        $state.go('dhc.game');
                    }
                };

                $scope.acceptRecommendation = function () {
                    $scope.healthCoachEvent = 'recommendationAccepted';
                    activityController.active = true;
                    activityController.formActive = activityController.formEnabled;
                };

                $scope.dismiss = function dismiss() {
                    SocialInteractionService.deleteSocialInteraction($scope.socialInteraction.id, { reason: 'denied'}).then(function (result) {

                        activityController.dismissed = true;
                        $scope.healthCoachEvent = $scope.socialInteraction.__t.toLowerCase() + 'Dismissed';
                    });

                };

                $scope.submit = function () {
                    var user = UserService.principal.getUser();
                    if (($scope.activity.owner.id || $scope.activity.owner) === user.id) {
                        $scope.saveActivity();
                    } else {
                        $scope.joinActivity();
                    }
                };

                $scope.editMode = function () {
                    activityController.formActive = activityController.formEnabled;
                    $scope.$root.$broadcast('healthCoach:event', 'editActivity');
                };
                $scope.deleteMode = function () {
                    activityController.deleteMode = true;
                    $scope.$root.$broadcast('healthCoach:event', 'deleteActivity');
                };

                $scope.deleteActivity = function deleteActivity() {
                    ActivityService.deleteActivity($scope.activity.id)
                        .then(function () {
                            $state.go('homedispatcher');
                        });
                };
                $scope.joinActivity = function joinActivity() {
                    ActivityService.joinPlan($scope.activity).then(function (joinedActivity) {
                        // queue event for next state
                        HealthCoachService.queueEvent('invitationAccepted');
                        $state.go('dhc.activity', { idea: idea.id, activity: joinedActivity.id, socialInteraction: '' });
                    });
                };
                $scope.saveActivity = function saveActivity() {

                    ActivityService.savePlan($scope.activity).then(function (savedActivity) {

                        // queue event for next state
                        HealthCoachService.queueEvent('activitySaved');

                        $scope.activity = savedActivity;
                        activityController.dirty = false;

                        var inviteAll = activityController.inviteOthers === 'all';
                        if (inviteAll || $scope.usersToBeInvited.length > 0) {

                            invitation.refDocs = [
                                {
                                    docId: $scope.activity.id,
                                    model: 'Activity'
                                }
                            ];

                            if ($scope.mode === 'campaignlead') {

                                if(campaignInvitation) {
                                    SocialInteractionService.putSocialInteraction(campaignInvitation).then(function () {
                                        $state.transitionTo($state.current, $stateParams, {
                                            reload: true,
                                            inherit: false,
                                            notify: true
                                        });
                                    });
                                } else {
                                    invitation.targetSpaces = [
                                        {
                                            type: 'campaign',
                                            targetId: campaign.id
                                        }
                                    ];
                                    SocialInteractionService.postInvitation($scope.socialInteraction).then(function (saved) {
                                        $state.go($state.current.name, { idea: idea.id, activity: savedActivity.id, socialInteraction: saved.id });
                                    });
                                }

                            } else if (inviteAll && !campaignInvitation) {
                                invitation.targetSpaces = [
                                    {
                                        type: 'campaign',
                                        targetId: campaign.id
                                    }
                                ];

                                SocialInteractionService.postInvitation(invitation);

                            } else if (!inviteAll) {

                                var toBeInvited = _.groupBy($scope.usersToBeInvited, function (user) {
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

                                if (emails && emails.length > 0) {
                                    ActivityService.inviteEmailToJoinPlan(emails.join(' '), savedActivity);
                                }
                            }
                        }

                        if(mode !== 'campaignlead') {
                            $state.go($state.current.name, { idea: idea.id, activity: savedActivity.id, socialInteraction: '' });
                        }

                    });


                };
            }
        ]);

})();