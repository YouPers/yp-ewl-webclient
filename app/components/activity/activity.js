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
                        authored: true,
                        "filter[activity]": activity.id
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

                $scope.isScheduled = activity && activity.id;
                $scope.isOwner = (activity.owner.id || activity.owner) === UserService.principal.getUser().id;
                $scope.isJoiner = $scope.isScheduled && ActivityService.isJoiningUser(activity);
                $scope.isCampaignLead = $state.$current.parent.name === 'dcm';
                $scope.isInvitation = socialInteraction && socialInteraction.__t === 'Invitation';
                $scope.isRecommendation = socialInteraction && socialInteraction.__t === 'Recommendation';
                $scope.isNewCampaignActivity = $scope.isCampaignLead && !$scope.isScheduled;

                if ($scope.isScheduled) {
                    $scope.pageTitle = 'PlannedActivity';
                } else if ($scope.isInvitation) {
                    $scope.pageTitle = 'Invitation';
                } else if ($scope.isRecommendation) {
                    $scope.pageTitle = 'Recommendation';
                } else if ($scope.isCampaignLead) {
                    $scope.pageTitle = 'NewCampaignActivity';
                } else {
                    throw new Error('Unknown state');
                }

                $scope.formContainer = {};

                var activityController = this;

                activityController.formEnabled = !$scope.isScheduled;
                activityController.canEdit = $scope.isScheduled && $scope.isOwner;
                activityController.canDelete = $scope.isScheduled && ($scope.isOwner || $scope.isJoiner);

                $scope.minPublishDate = moment.max(moment(), moment(campaign.start)).toDate();

                var invitation = {
                    author: UserService.principal.getUser(),
                    authorType: $scope.isCampaignLead ? 'campaignLead' : 'user',
                    __t: 'Invitation',

                    publishFrom: $scope.minPublishDate,
                    publishTo: moment.min(moment($scope.minPublishDate).add(3, 'days').endOf('day'), moment(campaign.end).endOf('day')).toDate()
                };

                if($scope.isCampaignLead) {
                    $scope.socialInteraction = campaignInvitation || invitation;

                    $scope.$watch('socialInteraction.publishFrom', function (date) {
                        var si = $scope.socialInteraction;
                        if(moment(si.publishFrom).isAfter(moment(si.publishTo))) {
                            si.publishTo = moment(si.publishFrom).startOf('day').toString();
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
                if ($scope.isScheduled) {

                    // set the organizer's invitation status if this is already scheduled, so he shows up as organizer
                    activity.owner.invitationStatus = 'organizer';
                    $scope.invitedUsers = [activity.owner];

                    if (campaignInvitation && campaignInvitation.id) { // check if campaign is already invited
                        activityController.inviteOthers = 'all';
                        $scope.inviteLocked = true;
                    }

                    // find out whether we do inviteAll oder Selected or nobody
                    if (invitationStatus && invitationStatus.length > 0) {
                        activityController.inviteOthers = activityController.inviteOthers || 'selected';
                        _.each(invitationStatus, function (status) {
                            var user = status.user || {email: status.email};
                            user.invitationStatus = status.status;
                            $scope.invitedUsers.push(user);
                        });
                    }


                } else {
                    $scope.invitedUsers = [];

                    if ($scope.isCampaignLead) {
                        activityController.inviteOthers = 'all';
                        $scope.inviteLocked = true;
                    }
                }
                activityController.inviteOthers = activityController.inviteOthers || 'none';

                // exclude all already invited users, me as the owner, and all campaignLeads from this campaign
                $scope.usersExcludedForInvitation = $scope.invitedUsers.concat($scope.activity.owner).concat(campaign.campaignLeads);

                $scope.usersToBeInvited = [];

                $scope.onUserSelected = function onUserSelected(selection) {
                    $scope.usersToBeInvited.push(selection);
                    $scope.usersExcludedForInvitation.push(selection);
                    selection = '';
                    $scope.noUserFound = false;
                };

                $scope.onEmailSelected = function onEmailSelected(selection) {
                    $scope.usersToBeInvited.push(selection);
                    $scope.emailToBeInvited = "";
                    $scope.noUserFound = false;
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
                            } else {
                                if ($scope.healthCoachEvent === 'conflictingEvent') {
                                    $scope.healthCoachEvent = healthCoachEvent;
                                }
                            }

                            $scope.events.push(event);

                        });

                    });
                }, 200);

                $scope.$watch('activity', validateActivity, true);

                $scope.$root.$on('InviteUserSearch:noCandidatesFound', function(event) {
                        $scope.noUserFound = true;
                    }
                );

                $scope.backToGame = function () {
                    if ($scope.isCampaignLead) {
                        $state.go('dcm.home');
                    } else {
                        $state.go('dhc.game', {view: ""});
                    }
                };

                $scope.dismiss = function dismiss() {
                    SocialInteractionService.deleteSocialInteraction($scope.socialInteraction.id, { reason: 'denied'})
                        .then(function (result) {
                            if ($scope.isRecommendation) {
                                HealthCoachService.queueEvent('recommendationDismissed');

                                // we wait 100ms here before we go back to the main Screen, because otherwise we
                                // will not see a potentially created new Recommendation
                                // reason: new CoachRecs are created asynchronously.
                                $timeout(function () {
                                    return $scope.backToGame();
                                }, 100);

                            } else {
                                HealthCoachService.queueEvent('invitationDismissed');
                                return $scope.backToGame();
                            }


                    });

                };

                $scope.enterEditMode = function () {
                    activityController.editModeEnabled = true;
                    activityController.formEnabled = true;
                    if ($scope.activity.joiningUsers && $scope.activity.joiningUsers.length === 0) {
                        $scope.healthCoachEvent = 'editOwnActivityAlone';
                    } else {
                        $scope.healthCoachEvent = 'editOwnActivityWithJoiners';
                    }
                };

                $scope.enterDeleteMode = function () {
                    activityController.deleteModeEnabled = true;
                    if ($scope.isJoiner) {
                        $scope.healthCoachEvent = 'deleteJoinedActivity';
                    } else if ($scope.isOwner && $scope.activity.joiningUsers.length === 0) {
                        $scope.healthCoachEvent = 'deleteOwnActivityAlone';
                    } else if ($scope.isOwner && $scope.activity.joiningUsers.length >= 0) {
                        $scope.healthCoachEvent = 'deleteOwnActivityWithJoiners';
                    } else {
                        throw new Error('Unexpected State');
                    }
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

                        var inviteAll = activityController.inviteOthers === 'all';
                        if (inviteAll || $scope.usersToBeInvited.length > 0) {

                            invitation.activity = $scope.activity.id;
                            invitation.idea = $scope.idea.id;

                            if ($scope.isCampaignLead) {

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
                                        HealthCoachService.queueEvent('invitationCreated');
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

                        $state.go($state.current.name, { idea: idea.id, activity: savedActivity.id, socialInteraction: '' }, { reload: true });

                    });


                };
            }
        ]);

})();