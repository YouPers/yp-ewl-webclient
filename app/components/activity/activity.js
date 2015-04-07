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
            existingCampaignInvitation: ['$stateParams', 'SocialInteractionService', 'activity', 'idea',
                function ($stateParams, SocialInteractionService, activity, idea) {
                if (activity.id && idea.defaultexecutiontype !== 'self') {
                    return SocialInteractionService.getInvitations({
                        populate: 'author',
                        targetId: $stateParams.campaignId,
                        authored: true,
                        publishFrom: false,
                        publishTo: false,
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

            healthCoachEvent: ['$state', 'ActivityService', 'UserService', 'campaign', 'socialInteraction', 'activity', 'activityEvents',
                function ($state, ActivityService, UserService, campaign, socialInteraction, activity, activityEvents) {

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

                            if(!ActivityService.isOwner(activity, UserService.principal.getUser())) {
                                return 'stateEnterAsSpectator';
                            }

                            return 'stateEnter';
                        }

                    }

                    return getEventName();

                }]
        })


        .controller('ActivityController', [ '$scope', '$rootScope', '$state', '$stateParams', '$timeout',
            'UserService', 'ActivityService', 'SocialInteractionService', 'HealthCoachService', 'CampaignService',
            'healthCoachEvent', // this resolve is from dhc or dcm activity state
            'campaign', 'idea', 'activity', 'activityEvents', 'socialInteraction', 'existingCampaignInvitation', 'invitationStatus',
            function ($scope, $rootScope, $state, $stateParams, $timeout,
                      UserService, ActivityService, SocialInteractionService, HealthCoachService, CampaignService, healthCoachEvent,
                      campaign, idea, activity, activityEvents, socialInteraction, existingCampaignInvitation, invitationStatus) {


                $scope.healthCoachEvent = healthCoachEvent;
                $scope.campaign = campaign;
                $scope.idea = idea;
                $scope.events = _.filter(activityEvents, { status: 'open'});

                $scope.activity = activity;

                // start and end times are stored/manipulated in distinct properties, because the date-picker removes the time in a date
                $scope.activity.startTime = $scope.activity.start;
                $scope.activity.endTime = $scope.activity.end;

                function restoreActivityTime(activity) {
                    activity.start = moment(activity.start)
                        .hour(moment(activity.startTime).hour())
                        .minute(moment(activity.startTime).minute()).startOf('minute').toDate();

                    // set the activity.end by combining the activity.start "date-portion" with the "endTime"
                    // reason: we do not support multi-day events, and when the user changes the start-date,
                    // the end-date needs to stay on the same day.
                    activity.end = moment(activity.start)
                        .hour(moment(activity.endTime).hour())
                        .minute(moment(activity.endTime).minute()).startOf('minute').toDate();
                }

                $scope.isScheduled = activity && activity.id;
                $scope.isOwner = (activity.owner.id || activity.owner) === UserService.principal.getUser().id;
                $scope.isJoiner = $scope.isScheduled && ActivityService.isJoiningUser(activity);
                $scope.isCampaignLead = CampaignService.isCampaignLead(campaign);
                $scope.isInvitation = socialInteraction && socialInteraction.__t === 'Invitation';
                $scope.isRecommendation = socialInteraction && socialInteraction.__t === 'Recommendation';
                $scope.isDcm = $state.current.name.indexOf('dcm') !== -1;
                $scope.isNewCampaignActivity = $scope.isCampaignLead && !$scope.isScheduled && $scope.isDcm;
                $scope.isCampaignActivity = (activity.authorType === 'campaignLead') || $scope.isNewCampaignActivity;

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

                // determine the right socialInteraction
                var newInvitation = {
                    author: UserService.principal.getUser(),
                    authorType: $scope.isCampaignLead ? 'campaignLead' : 'user',
                    __t: 'Invitation',

                    publishFrom: $scope.minPublishDate,
                    publishTo: moment.min(moment($scope.minPublishDate).add(3, 'days').endOf('day'), moment(campaign.end).endOf('day')).toDate()
                };

                // determine the right socialInteraction to work with
                if ($scope.isRecommendation) {
                    // the passed in soi is a rec, so this is a new activity
                    $scope.socialInteraction = newInvitation;
                } else if ($scope.isInvitation) {
                    // the passed in SocialInteraction is an Invitation
                    $scope.socialInteraction = socialInteraction;
                    if (socialInteraction.id !== existingCampaignInvitation.id) {
                        throw new Error('passedIn soi not equal existingCampaignInv, why???');
                    }
                } else {
                    // no social Interaction passed in
                    $scope.socialInteraction = newInvitation;
                }

                $scope.formContainer = {};

                var activityController = this;
                activityController.formEnabled = !$scope.isScheduled;
                activityController.canEdit = $scope.isScheduled && $scope.isOwner;
                activityController.canDelete = $scope.isScheduled && ($scope.isOwner || $scope.isJoiner);

                $scope.minPublishDate = moment.max(moment(), moment(campaign.start)).toDate();



                if($scope.isCampaignActivity) {
                    $scope.$watch('socialInteraction.publishFrom', function (date) {
                        var si = $scope.socialInteraction;
                        if(moment(si.publishFrom).isAfter(moment(si.publishTo))) {
                            si.publishTo = moment(si.publishFrom).startOf('day').toDate();
                        }
                    });
                    $scope.$watch('socialInteraction.publishTo', function (date) {
                        var si = $scope.socialInteraction;
                        if(moment(si.publishFrom).isAfter(moment(si.publishTo))) {
                            si.publishFrom = moment(si.publishTo).startOf('day').toDate();
                        }
                    });
                }


                // user, email & campaign wide selections
                if ($scope.isScheduled) {

                    // set the organizer's invitation status if this is already scheduled, so he shows up as organizer
                    activity.owner.invitationStatus = 'organizer';
                    $scope.invitedUsers = [activity.owner];

                    if (existingCampaignInvitation && existingCampaignInvitation.id) { // check if campaign is already invited
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
                    _.remove($scope.usersToBeInvited, function (item) {
                        return user.id ? user.id === item.id : user === item;
                    });
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

                    // clone the activity before replacing the start/end dates, the date-picker would loose it's focus otherwise
                    var clonedActivity = _.clone($scope.activity);
                    restoreActivityTime(clonedActivity);

                    ActivityService.validateActivity(clonedActivity).then(function (activityValidationResults) {

                        var events = [];
                        var conflictingEvents = [];
                        _.forEach(activityValidationResults, function (result) {
                            var event = result.event;

                            event.activity = $scope.activity;

                            if(result.conflictingEvent) {
                                event.conflictingEvent = result.conflictingEvent;
                                conflictingEvents.push(event.conflictingEvent);
                                $scope.healthCoachEvent = 'conflictingEvent';
                            } else {
                                if ($scope.healthCoachEvent === 'conflictingEvent') {
                                    $scope.healthCoachEvent = healthCoachEvent;
                                }
                            }

                            events.push(event);

                        });
                        ActivityService.populateIdeas(events);
                        ActivityService.populateIdeas(conflictingEvents);
                        $scope.events = events;

                    });
                }, 200);

                $scope.$watch('activity', validateActivity, true);

                $scope.$root.$on('InviteUserSearch:noCandidatesFound', function(event) {
                        $scope.noUserFound = true;
                    }
                );

                $scope.backToGame = function () {

                    // we want to stay in the app we are in
                    if ($scope.isDcm) {
                        $state.go('dcm.home', {campaignId: campaign.id});
                    } else {
                        $state.go('dhc.game', {view: "", campaignId: campaign.id});
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
                if($stateParams.edit) {
                    $scope.enterEditMode();
                    $scope.$watch('formContainer.form', function (form) {
                        if(form) {
                            form.$setDirty();
                        }
                    });
                }

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
                    $scope.$root.$broadcast('busy.begin', {url: "activities", name: "deleteActivity"});

                    ActivityService.deleteActivity($scope.activity.id)
                        .then(function () {
                            $scope.backToGame();
                            $scope.$root.$broadcast('busy.end', {url: "activities", name: "deleteActivity"});
                        });
                };
                $scope.joinActivity = function joinActivity() {
                    $scope.$root.$broadcast('busy.begin', {url: "activities", name: "joinActivity"});

                    ActivityService.joinPlan($scope.activity).then(function (joinedActivity) {
                        // queue event for next state
                        HealthCoachService.queueEvent('invitationAccepted');
                        $state.go('dhc.activity', { idea: idea.id, activity: joinedActivity.id, socialInteraction: '' });
                        $scope.$root.$broadcast('busy.end', {url: "activities", name: "joinActivity"});
                    });
                };
                $scope.saveActivity = function saveActivity() {
                    $scope.$root.$broadcast('busy.begin', {url: "activities", name: "saveActivity"});

                    restoreActivityTime($scope.activity);

                    ActivityService.savePlan($scope.activity).then(function (savedActivity) {


                        function _finalCb(savedSoi, healthCoachEvent) {
                            if (healthCoachEvent) {
                                HealthCoachService.queueEvent(healthCoachEvent);
                            }

                            if($stateParams.edit) {
                                return $scope.backToGame();
                            }

                            $state.go($state.current.name, { idea: idea.id, activity: savedActivity.id, socialInteraction: savedSoi ? savedSoi.id : '' }, { reload: true });
                            $scope.$root.$broadcast('busy.end', {url: "activities", name: "saveActivity"});

                        }

                        // queue event for next state
                        HealthCoachService.queueEvent(activity.executionType + 'ActivitySaved');

                        $scope.activity = savedActivity;

                        var inviteAll = activityController.inviteOthers === 'all';
                        if (inviteAll || $scope.usersToBeInvited.length > 0) {

                            newInvitation.activity = $scope.activity.id;
                            newInvitation.idea = $scope.idea.id;

                            if ($scope.isCampaignLead && inviteAll) {

                                $scope.socialInteraction.targetSpaces = [
                                    {
                                        type: 'campaign',
                                        targetId: campaign.id
                                    }
                                ];

                                // is it PUT / update   or POST a new one
                                if($scope.socialInteraction.id) {
                                    SocialInteractionService.putSocialInteraction($scope.socialInteraction).then(function (savedInv) {
                                        return _finalCb(savedInv);
                                    });
                                } else {
                                    SocialInteractionService.postInvitation($scope.socialInteraction).then(function (saved) {
                                        return _finalCb(saved, 'invitationCreated');
                                    });
                                }

                            } else {

                                newInvitation.publishFrom = $scope.minPublishDate;
                                newInvitation.publishTo = $scope.events[$scope.events.length - 1].end;

                                if (inviteAll && !campaignInvitation) {
                                    newInvitation.targetSpaces = [
                                        {
                                            type: 'campaign',
                                            targetId: campaign.id
                                        }
                                    ];

                                    SocialInteractionService.postInvitation(newInvitation).then(function(savedInv) {
                                        // do not pass the savedInv to the Cb, because we don't want to show
                                        // the soi on the following state. WL-1603
                                        return _finalCb();
                                    });

                                } else if (!inviteAll) {

                                    var toBeInvited = _.groupBy($scope.usersToBeInvited, function (user) {
                                        return typeof user;
                                    });

                                    var users = toBeInvited.object;
                                    var emails = toBeInvited.string;

                                    newInvitation.targetSpaces = [];
                                    _.forEach(users, function (user) {
                                        newInvitation.targetSpaces.push({
                                            type: 'user',
                                            targetId: user.id
                                        });
                                    });

                                    SocialInteractionService.postInvitation(newInvitation).then(function(savedInv) {
                                        if (emails && emails.length > 0) {
                                            ActivityService.inviteEmailToJoinPlan(emails.join(' '), savedActivity).then(function () {
                                                // do not pass the savedInv to the Cb, because we don't want to show
                                                // the soi on the following state. WL-1603
                                                return _finalCb();
                                            });
                                        } else {
                                            // do not pass the savedInv to the Cb, because we don't want to show
                                            // the soi on the following state. WL-1603
                                            return _finalCb();
                                        }

                                    });

                                } else {
                                    return _finalCb();
                                }
                            }
                        } else {
                            return _finalCb();
                        }
                    }, function saveErrorCb(err) {
                        $scope.$emit('clientmsg:error', err);
                        $scope.$root.$broadcast('busy.end', {url: "activities", name: "saveActivity"});
                    });


                };
            }
        ]);

})();