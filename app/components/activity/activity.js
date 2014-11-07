(function () {
    'use strict';

    angular.module('yp.components.activity', ['yp.components.user'])

        .config(['$translateWtiPartialLoaderProvider',
            function ($translateWtiPartialLoaderProvider) {
                $translateWtiPartialLoaderProvider.addPart('components/activity/activity');
            }])

        .constant('activityResolveConfiguration', {

            idea: ['$stateParams', 'ActivityService', 'activity', function ($stateParams, ActivityService, activity) {
                var idea = $stateParams.idea;
                // if we do not have an idea in the stateParams try to get it from the activity
                if (!idea) {
                    idea = activity && activity.idea;
                }
                if (idea.id) { // we found a populated idea, just return it
                    return idea;
                } else if (idea) { // we found a idea id, get it from Service
                    return  ActivityService.getIdea(idea);
                } else {
                    throw new Error('activity: idea is required');
                }
            }],

            socialInteraction: ['$stateParams', 'SocialInteractionService', function ($stateParams, SocialInteractionService) {
                if ($stateParams.socialInteraction) {
                    return  SocialInteractionService.getSocialInteraction($stateParams.socialInteraction);
                } else {
                    return undefined;
                }
            }],
            campaignInvitation: ['$stateParams', 'SocialInteractionService', 'activity', 'idea',
                function ($stateParams, SocialInteractionService, activity, idea) {
                if (activity.id && idea.defaultexecutiontype !== 'self') {
                    return SocialInteractionService.getInvitations({
                        populate: 'author',
                        targetId: $stateParams.campaignId,
                        refDocId: activity.id,
                        authored: true
                    }).then(function (invitations) {
                        return invitations.length > 0 ? invitations[0] : undefined;
                    });
                } else {
                    return undefined;
                }
            }],
            invitationStatus: ['$stateParams', 'ActivityService', 'idea', function ($stateParams, ActivityService, idea) {
                if ($stateParams.activity && idea.defaultexecutiontype !== 'self') {
                    return  ActivityService.getInvitationStatus($stateParams.activity);
                } else {
                    return [];
                }
            }],

            activity: ['$stateParams', 'ActivityService', 'socialInteraction', '$q',
                function ($stateParams, ActivityService, socialInteraction, $q) {
                    if (socialInteraction && socialInteraction.activity) {
                        return socialInteraction.activity;
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

            healthCoachEvent: ['$state', 'ActivityService', 'campaign', 'socialInteraction', 'activity', 'activityEvents',
                function ($state, ActivityService, campaign, socialInteraction, activity, activityEvents) {

                    if(!campaign) {
                        return;
                    }

                    function getEventName() {

                        // workaround until we find a fix to have 2 distinct activity states with a dhc/dcm parent
                        if($state.$current.parent && $state.$current.parent.toString() === 'dhc') { // dhc

                            var hasDueEvents = _.filter(activityEvents, function (event) {
                                return moment().diff((event).end) > 0;
                            }).length > 0;

                            if(socialInteraction && socialInteraction.__t === 'Recommendation') {
                                return 'scheduleRecommendedActivity';
                            } else if(hasDueEvents) {
                                return 'eventsDue';
                            }else if(!hasDueEvents && activity.executionType === 'group') {
                                return 'groupActivityNoEventsDue';
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

                $scope.isOwner = (activity.owner.id || activity.owner) === UserService.principal.getUser().id;
                $scope.isScheduled = activity && activity.id;

                $scope.formContainer = {};

                var mode;

                if($state.$current.parent.name === 'dcm') {
                    mode = 'campaignlead';
                } else if ($scope.isScheduled && ActivityService.isOwner(activity)) {
                    mode = 'owned';
                } else if ($scope.isScheduled && ActivityService.isJoiningUser(activity)) {
                    mode = 'joined';
                } else if (socialInteraction) {
                    mode = socialInteraction.__t.toLowerCase();
                } else {
                    mode = 'schedule';
                }

                var activityController = this;
                activityController.mode = $scope.mode = mode;

                // only recommendations have to be activated
                activityController.active = !socialInteraction || socialInteraction.__t !== 'Recommendation';
                activityController.formEnabled = (activity.id && $scope.isOwner) ||
                    mode === 'recommendation' ||
                    mode === 'campaignlead' ||
                    mode === 'schedule';
                activityController.formActive = mode === 'schedule' || (mode === 'campaignlead' && !activity.id);

                // invitations

                $scope.minPublishDate = moment.max(moment(), moment(campaign.start)).toDate();

                var invitation = {
                    author: UserService.principal.getUser(),
                    authorType: mode === 'campaignlead' ? 'campaignLead' : 'user',
                    __t: 'Invitation',

                    publishFrom: $scope.minPublishDate,
                    publishTo: moment.min(moment($scope.minPublishDate).add(3, 'days').endOf('day'), moment(campaign.end).endOf('day')).toDate()
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

                // set the organizer's invitation status if this is already scheduled
                if ($scope.isScheduled) {
                    activity.owner.invitationStatus = 'organizer';
                    $scope.invitedUsers = [activity.owner];
                    if (invitationStatus && invitationStatus.length > 0) {
                        activityController.inviteOthers = 'selected';
                        _.each(invitationStatus, function (status) {
                            var user = status.user || {email: status.email};
                            user.invitationStatus = status.status;
                            $scope.invitedUsers.push(user);
                        });
                    }
                } else {
                    $scope.invitedUsers = [];
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

                var validateActivity = _.debounce(function (newActivity, old) {
                    // return if the form is in invalid state
                    if ($scope.formContainer.form && !$scope.formContainer.form.$valid) {
                        return;
                    }
                    // cancel if activity did not change, and the activity is not new
                    if (_.isEqual(newActivity, old) && $scope.isScheduled && $scope.events.length > 0) {
                        return;
                    }

                    ActivityService.validateActivity($scope.activity).then(function (activityValidationResults) {

                        $scope.events = [];
                        _.forEach(activityValidationResults, function (result) {
                            var event = result.event;

                            event.activity = $scope.activity;

                            if(result.conflictingEvent) {
                                event.conflictingEvent = result.conflictingEvent;
                                $scope.healthCoachEvent = 'conflictingEvent';
                            }

                            $scope.events.push(event);

                        });

                    });
                }, 200);

                $scope.$watch('activity', validateActivity, true);

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
                        $state.go('dhc.game', {view: ""});
                    }
                };

                $scope.acceptRecommendation = function () {
                    if($scope.healthCoachEvent !== 'conflictingEvent') {
                        $scope.healthCoachEvent = 'recommendationAccepted';
                    }
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
                    $scope.$root.$broadcast('healthCoach:event', 'editOwnActivity');
                };
                $scope.deleteMode = function () {
                    activityController.deleteMode = true;
                    $scope.$root.$broadcast('healthCoach:event', $scope.isOwner ? 'deleteOwnActivity' : 'deleteJoinedActivity');
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
                        HealthCoachService.queueEvent(activity.executionType + 'ActivitySaved');

                        $scope.activity = savedActivity;
                        activityController.dirty = false;

                        var inviteAll = activityController.inviteOthers === 'all';
                        if (inviteAll || $scope.usersToBeInvited.length > 0) {

                            invitation.activity = $scope.activity.id;
                            invitation.idea = $scope.idea.id;

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
                                    ActivityService.inviteEmailToJoinPlan(emails.join(' '), savedActivity).then(function () {
                                        $state.go($state.current.name, { idea: idea.id, activity: savedActivity.id, socialInteraction: '' }, { reload: true });
                                    });
                                }
                            }
                        }

                        if(mode !== 'campaignlead') {
                            $state.go($state.current.name, { idea: idea.id, activity: savedActivity.id, socialInteraction: '' }, { reload: true });
                        }

                    });


                };
            }
        ]);

})();