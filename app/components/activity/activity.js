(function () {
    'use strict';

    angular.module('yp.components.activity', ['yp.components.user'])

        .config(['$translateWtiPartialLoaderProvider',
            function ($translateWtiPartialLoaderProvider) {
                $translateWtiPartialLoaderProvider.addPart('components/activity/activity');
            }])

        .constant('activityResolveConfiguration', {

            clickedSocialInteraction: ['$stateParams', 'SocialInteractionService', function ($stateParams, SocialInteractionService) {
                if ($stateParams.socialInteraction) {
                    return SocialInteractionService.getSocialInteraction($stateParams.socialInteraction);
                } else {
                    return undefined;
                }
            }],


            activity: ['$rootScope', '$stateParams', 'ActivityService', 'clickedSocialInteraction', '$q',
                function ($rootScope, $stateParams, ActivityService, clickedSocialInteraction, $q) {
                    if (clickedSocialInteraction && clickedSocialInteraction.activity) {
                        return clickedSocialInteraction.activity;
                    }
                    if ($stateParams.activity) {
                        return ActivityService.getActivity($stateParams.activity).catch(function (err) {
                            return $q.reject(err.status === 403 ? 'clientmsg.error.activity.notParticipating' : err);
                        });
                    } else {
                        return ActivityService.getDefaultActivity($stateParams.idea, {campaignId: $stateParams.campaignId});
                    }
                }],

            idea: ['$stateParams', 'ActivityService', 'activity', function ($stateParams, ActivityService, activity) {
                var ideaId = $stateParams.idea;
                // if we do not have an idea in the stateParams try to get it from the activity
                if (!ideaId) {
                    ideaId = activity && activity.idea;
                }

                if (ideaId.id) { // we found a populated idea, just return it
                    return ideaId;
                } else if (ideaId) { // we found a idea id, get it from Service
                    return ActivityService.getIdea(ideaId);
                } else {
                    throw new Error('activity: idea is required');
                }
            }],

            activityEvents: ['ActivityService', 'activity', function (ActivityService, activity) {

                if (!activity.id) {
                    return [];
                }
                return ActivityService.getActivityEvents({
                    'filter[activity]': activity.id,
                    sort: 'start'
                }).then(function (events) {
                    // replace the unpopulated event.activity with the full activity object
                    _.forEach(events, function (event) {
                        event.activity = activity;
                    });
                    return events;
                });
            }],


            existingCampaignInvitation: ['$stateParams', 'SocialInteractionService', 'activity', 'idea', 'UserService',
                function ($stateParams, SocialInteractionService, activity, idea, UserService) {
                    if (activity.id && idea.defaultexecutiontype !== 'self') {
                        return SocialInteractionService.getInvitations({
                            populate: 'author',
                            targetId: $stateParams.campaignId,
                            authored: true,
                            dismissed: true,
                            publishFrom: false,
                            publishTo: false,
                            "filter[activity]": activity.id
                        }).then(function (invitations) {
                            var campInv =  invitations.length > 0 ? invitations[0] : undefined;

                            // if the author is the current user, use the session object instead,
                            // so we get updates when the user changes.

                            // TODO: Replace with WL-1017
                            if (campInv) {
                                if (campInv.author.id === UserService.principal.getUser().id ) {
                                    campInv.author = UserService.principal.getUser();
                                }
                            }
                            return campInv;
                        });
                    } else {
                        return undefined;
                    }
                }],

            invitationStatus: ['$stateParams', 'ActivityService', 'idea', function ($stateParams, ActivityService, idea) {
                if ($stateParams.activity && idea.defaultexecutiontype !== 'self') {
                    return ActivityService.getInvitationStatus($stateParams.activity);
                } else {
                    return [];
                }
            }],

            healthCoachEvent: ['$state', 'ActivityService', 'UserService', 'campaign', 'clickedSocialInteraction', 'activity', 'activityEvents',
                function ($state, ActivityService, UserService, campaign, clickedSocialInteraction, activity, activityEvents) {

                    if (!campaign) {
                        return;
                    }

                    function getEventName() {

                        // workaround until we find a fix to have 2 distinct activity states with a dhc/dcm parent
                        if ($state.$current.parent && $state.$current.parent.toString() === 'dhc') { // dhc

                            var hasDueEvents = _.filter(activityEvents, function (event) {
                                    return moment().diff((event).end) > 0;
                                }).length > 0;

                            if (clickedSocialInteraction && clickedSocialInteraction.__t === 'Recommendation') {
                                return 'scheduleRecommendedActivity';
                            } else if (hasDueEvents) {
                                return 'eventsDue';
                            } else if (!hasDueEvents && activity.executionType === 'group') {
                                return 'groupActivityNoEventsDue';
                            } else {
                                return 'stateEnter';
                            }


                        } else { // dcm

                            if (!ActivityService.isOwner(activity, UserService.principal.getUser())) {
                                return 'stateEnterAsSpectator';
                            }

                            return 'stateEnter';
                        }

                    }

                    return getEventName();

                }]
        })


        .controller('ActivityController', ['$scope', '$rootScope', '$state', '$stateParams', '$timeout', 'localStorageService',
            'UserService', 'ActivityService', 'SocialInteractionService', 'HealthCoachService', 'CampaignService',
            'healthCoachEvent', // this resolve is from dhc or dcm activity state
            'campaign', 'idea', 'activity', 'activityEvents', 'clickedSocialInteraction', 'existingCampaignInvitation', 'invitationStatus',
            function ($scope, $rootScope, $state, $stateParams, $timeout, localStorageService,
                      UserService, ActivityService, SocialInteractionService, HealthCoachService, CampaignService, healthCoachEvent,
                      campaign, idea, activity, activityEvents, clickedSocialInteraction, existingCampaignInvitation, invitationStatus) {

                var user = $scope.principal.getUser();

                //////////////////////////
                // setup scope properties
                $scope.healthCoachEvent = healthCoachEvent;
                $scope.campaign = campaign;
                $scope.idea = idea;
                $scope.events = _.filter(activityEvents, {status: 'open'});
                $scope.activity = activity;
                $scope.activity.startTime = $scope.activity.start;
                $scope.activity.endTime = $scope.activity.end;
                $scope.isScheduled = activity && activity.id;
                $scope.isOwner = (activity.owner.id || activity.owner) === UserService.principal.getUser().id;
                $scope.isJoiner = $scope.isScheduled && ActivityService.isJoiningUser(activity);
                $scope.isCampaignLead = CampaignService.isCampaignLead(campaign);
                $scope.isInvitation = clickedSocialInteraction && clickedSocialInteraction.__t === 'Invitation';
                $scope.isRecommendation = clickedSocialInteraction && clickedSocialInteraction.__t === 'Recommendation';
                $scope.isDcm = $state.current.name.indexOf('dcm') !== -1;
                $scope.isDhc = $state.current.name.indexOf('dhc') !== -1;
                $scope.isNewActivity = !$scope.isScheduled && !$scope.isRecommendation;
                $scope.pageTitle = _getPageTitle();

                // we deal with possibly two SocialInteractions here
                // - the Soi that caused the user to come here and needs to be answered:
                //   an Invitation or a Recommendation BY ANOTHER user that this user is answering by clicking
                //   on the buttons on the right side.
                //   --> $scope.soiToAnswer
                // - the Soi that is being published by me by saving this activity, authored by me.
                //   --> $scope.soiPublished
                //
                //
                // The user came here either by clicking a Soi or by clicking on a planned activity event (without
                // directly referencing a Social Interaction, so we need to fill in our scope attriubtes with
                // the correct Sois. The Soi a user clicked on can be the one being published (in case a campaignlead
                // clicks it in DCM) or, more common, one to answer here. We need to figure out what we have...

                // if the user came here by clicking a Soi, but the Soi is not authored by himself, then he needs
                // to answer the Soi
                if (clickedSocialInteraction &&
                    (user.id !== (clickedSocialInteraction.author.id || clickedSocialInteraction.author))) {
                    $scope.soiToAnswer = clickedSocialInteraction;
                }

                // if the user clicked on a SocialInteraction of type Invitation AND he is the author of it, he has the option to
                // edit it, same if there is an existing campaignInvitation authored by this user
                if (clickedSocialInteraction &&
                    clickedSocialInteraction.__t === 'Invitation' &&
                    ((clickedSocialInteraction.author.id || clickedSocialInteraction.author) === user.id)) {
                    $scope.soiPublished = clickedSocialInteraction;
                } else if (existingCampaignInvitation &&
                    ((existingCampaignInvitation.author.id || existingCampaignInvitation.author) === user.id)) {
                    $scope.soiPublished = existingCampaignInvitation;
                }

                $scope.formContainer = {};

                //////////////////////////
                // setup controller properties

                var activityController = this;
                activityController.formEnabled = !$scope.isScheduled;
                activityController.canEdit = $scope.isScheduled && $scope.isOwner;
                activityController.canDelete = $scope.isScheduled && ($scope.isOwner || $scope.isJoiner);


                ///////////////////////////////////
                // update activity lookahead
                ActivityService.updateActivityLookahead(activity);

                ///////////////////////////////////
                // setup watchers and event-handlers


                $scope.$watch('activity', _.debounce(_validateActivity, 200), true);

                $scope.$root.$on('InviteUserSearch:noCandidatesFound', function (event) {
                        $scope.noUserFound = true;
                    }
                );


                //////////////////////////////////////////////////////////
                // setup invitations control
                _setupInvitationsControl();

                if ($stateParams.edit === 'true') {
                    _enterEditMode();
                }

                ////////////////////////////////////////////////////////////
                // $scope methods

                $scope.backToGame = function () {

                    // we want to stay in the app we are in
                    if ($scope.isDcm) {
                        $state.go('dcm.home', {campaignId: campaign.id, section: 'offers'});
                    } else {
                        $state.go('dhc.game', {view: "", campaignId: campaign.id});
                    }
                };

                $scope.dismiss = function dismiss() {
                    SocialInteractionService.deleteSocialInteraction($scope.soiToAnswer.id, {
                        reason: 'denied',
                        mode: 'participate'
                    })
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

                $scope.enterEditMode = _enterEditMode;


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
                        $state.go('dhc.activity', {idea: idea.id, activity: joinedActivity.id, socialInteraction: ''});
                        $scope.$root.$broadcast('busy.end', {url: "activities", name: "joinActivity"});
                    });
                };


                $scope.saveActivity = function saveActivity() {
                    $scope.$root.$broadcast('busy.begin', {url: "activities", name: "saveActivity"});

                    _restoreActivityTime($scope.activity);

                    ActivityService.savePlan($scope.activity).then(function (savedActivity) {


                        function _finalCb(savedSoi, healthCoachEvent) {
                            if (healthCoachEvent) {
                                HealthCoachService.queueEvent(healthCoachEvent);
                            }

                            $state.go($state.current.name, {
                                idea: idea.id,
                                activity: savedActivity.id,
                                socialInteraction: savedSoi ? savedSoi.id : '',
                                edit: false
                            }, {reload: true});
                            $scope.$root.$broadcast('busy.end', {url: "activities", name: "saveActivity"});

                        }

                        // queue event for next state
                        HealthCoachService.queueEvent(activity.executionType + 'ActivitySaved');

                        // it is empty in case of "non-group activities, where the control is hidden
                        if (activityController.inviteOthers === 'none' || !activityController.inviteOthers) {
                            // nobody to invite, so nothing else to do
                            return _finalCb();
                        } else {
                            var invitation = $scope.soiPublished;
                            invitation.activity = savedActivity.id;

                            // publish dates
                            _updatePublishDates(invitation, campaign, $scope.events);

                            var inviteAll = activityController.inviteOthers === 'all';
                            var inviteNewSelected = $scope.usersToBeInvited.length > 0;

                            if (inviteAll) {
                                invitation.targetSpaces = [
                                    {
                                        type: 'campaign',
                                        targetId: campaign.id
                                    }
                                ];

                                // we are calling the PUT or POST,
                                // PUT is needed to update publish-dates when activity was shifted
                                if (invitation.id) {
                                    SocialInteractionService.putSocialInteraction(invitation).then(function (savedInv) {
                                        return _finalCb(savedInv);
                                    });
                                } else {
                                    SocialInteractionService.postInvitation(invitation).then(function (saved) {
                                        return _finalCb(saved, 'invitationCreated');
                                    });
                                }

                            } else if (inviteNewSelected) {
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

                                SocialInteractionService.postInvitation(invitation).then(function (savedInv) {
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

                                }, function saveErrorCb(err) {
                                    $scope.$emit('clientmsg:error', err);
                                    $scope.$root.$broadcast('busy.end', {url: "activities", name: "saveActivity"});
                                });
                            } else {
                                // user clicked "selected" but did not enter anybody --> same as none
                                return _finalCb();
                            }
                        }
                    }, function saveErrorCb(err) {
                        $scope.$emit('clientmsg:error', err);
                        $scope.$root.$broadcast('busy.end', {url: "activities", name: "saveActivity"});
                    });


                };

                //////////////////////////////////////////////////////
                // internal helper functions
                ////////////////////////////////////////////

                // start and end times are stored/manipulated in distinct properties, because the date-picker removes the time in a date
                function _restoreActivityTime(activity) {
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

                function _updatePublishDates(socialInteraction, campaign, events) {
                    socialInteraction.publishFrom = moment.max(moment(), moment(campaign.start)).toDate();
                    socialInteraction.publishTo = moment.min(moment(_.last(events).end), moment(campaign.end)).toDate();
                }

                function _validateActivity(newActivity, old) {
                    // return if the form is in invalid state
                    if ($scope.formContainer.form && !$scope.formContainer.form.$valid) {
                        return;
                    }
                    // cancel if activity did not change, and the activity is not new
                    if ((_.isEqual(old, {}) || _.isEqual(newActivity, old)) && $scope.isScheduled && $scope.events.length > 0) {
                        return;
                    }


                    // clone the activity before replacing the start/end dates, the date-picker would loose it's focus otherwise
                    var clonedActivity = _.clone($scope.activity);
                    _restoreActivityTime(clonedActivity);

                    ActivityService.validateActivity(clonedActivity).then(function (activityValidationResults) {

                        var events = [];
                        var conflictingEvents = [];
                        _.forEach(activityValidationResults, function (result) {
                            var event = result.event;

                            event.activity = $scope.activity;

                            if (result.conflictingEvent) {
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

                        // TODO: This is wrong for already planned events, because they lose the .id
                        $scope.events = events;


                        // publishTo/publishFrom

                        if ($scope.isDcm) {
                            _updatePublishDates($scope.soiPublished, campaign, events);
                        }

                    });
                }

                function _getPageTitle() {
                    if ($scope.isScheduled) {
                        return 'PlannedActivity';
                    } else if ($scope.isInvitation) {
                        return 'Invitation';
                    } else if ($scope.isRecommendation) {
                        return 'Recommendation';
                    } else if ($scope.isDcm) {
                        return 'NewCampaignActivity';
                    } else if (!$scope.isScheduled && !$scope.soiToAnswer) {
                        return 'newActivity';
                    } else {
                        throw new Error('Unknown state');
                    }
                }

                function _enterEditMode() {
                    activityController.editModeEnabled = true;
                    activityController.formEnabled = true;
                    if ($scope.activity.joiningUsers && $scope.activity.joiningUsers.length === 0) {
                        $scope.healthCoachEvent = 'editOwnActivityAlone';
                    } else {
                        $scope.healthCoachEvent = 'editOwnActivityWithJoiners';
                    }
                }

                function _setupInvitationsControl() {
                    activityController.invitedUsers = [];

                    if ($scope.isScheduled) {

                        // add the organizer, the first in the array is always the organizer!

                        // if the current user is the organizer put the reference to the user in the session instead
                        // of the one delivered by the server
                        if ($scope.isOwner) {
                            activityController.invitedUsers.push($scope.principal.getUser());
                        } else {
                            activityController.invitedUsers.push(activity.owner);
                        }

                        if (existingCampaignInvitation) {
                            // check if campaign is already invited, do the check with existingCampaignInvitation because
                            // this includes the all-invitation also if it is not authored by the current user
                            // (the $scope.soiPublished is only there is this user publishes the Invitation.
                            activityController.inviteOthers = 'all';

                            // we have invited everybody, so we cannot undo this invitation and go back to
                            // "selected" or "none":  user needs to cancel the event if he is not happy with "inviting all"
                            $scope.inviteLocked = true;
                        }

                        // lookup invitation status (again) as the user object may be replaced by avatar upload
                        $scope.invitationStatus = function invitationStatus(user) {
                            return user.invitationStatus ||
                                _.find(invitationStatus, function (status) {
                                    return user.email ? status.user.email === user.email : status.user.id === user.id;
                                }).status;
                        };

                        // find out whether we have already invited some individuals.
                        if (invitationStatus && invitationStatus.length > 0) {
                            var invitedUsers = [];
                            activityController.inviteOthers = activityController.inviteOthers || 'selected';
                            _.each(invitationStatus, function (status) {
                                var user = status.user || {email: status.email};

                                // if the current user is listed put the session object instead of the
                                // server side object
                                if (user.id === $scope.principal.getUser().id) {
                                    user = $scope.principal.getUser();
                                }
                                user.invitationStatus = status.status;
                                invitedUsers.push(user);
                            });
                            activityController.invitedUsers = activityController.invitedUsers.concat(_.sortBy(invitedUsers, 'invitationStatus'));
                        }



                        // well, we have not invited 'all' and not invited any individuals, it is save to
                        // assume that we have not invited anybody yet!
                        activityController.inviteOthers = activityController.inviteOthers || 'none';

                    } else {
                        // this is a new, unsaved activity
                        // in DCM we always force to invite 'all', no other option possible
                        if ($scope.isDcm) {
                            activityController.inviteOthers = 'all';
                            $scope.inviteLocked = true;
                        }

                        // in DHC we make the user choose, so we leave activityController.inviteOthers empty in the
                        // beginning
                    }

                    // exclude all already invited users, me as the owner, and all campaignLeads from this campaign
                    $scope.usersExcludedForInvitation = activityController.invitedUsers.concat($scope.activity.owner);

                    $scope.usersToBeInvited = [];

                    $scope.onUserSelected = function onUserSelected(selection) {
                        $scope.usersToBeInvited.push(selection);
                        $scope.usersExcludedForInvitation.push(selection);
                        selection = '';
                    };

                    $scope.onEmailSelected = function onEmailSelected(selection) {
                        $scope.usersToBeInvited.push(selection);
                        $scope.emailToBeInvited = "";
                    };

                    $scope.removeUserToBeInvited = function (user) {
                        _.remove($scope.usersToBeInvited, function (item) {
                            return user.id ? user.id === item.id : user === item;
                        });
                    };


                    var invitationTemplate = {
                        author: user,
                        authorType: $scope.isCampaignLead ? 'campaignLead' : 'user',
                        __t: 'Invitation',
                        activity: activity.id,
                        idea: $scope.idea.id
                    };


                    $scope.$watch('activityController.inviteOthers', function (newValue, oldVal) {
                        if (!newValue) {
                            return;
                        }

                        // if I am not the organizer of this event, I will never publish an invitation for it
                        if (user.id !== (activity.owner.id || activity.owner)) {
                            return;
                        }

                        // using timeout here to give the form time to check its status, we are using $invalid
                        // in _validateActivity()
                        $timeout(function () {
                            _validateActivity($scope.activity, {});
                        });

                        var newInvite = _.clone(invitationTemplate);
                        // reset the author to point to the session reference
                        newInvite.author = $scope.principal.getUser();

                        if (newValue === 'none') {
                            $scope.soiPublished = undefined;
                        } else if (newValue === 'all') {
                            $scope.soiPublished = existingCampaignInvitation || newInvite;
                        } else if (newValue === 'selected') {
                            $scope.soiPublished = newInvite;
                        } else {
                            throw new Error('this should not be possible');
                        }
                    });


                }
            }
        ]);

})();