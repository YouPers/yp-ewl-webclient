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
                    return ActivityService.getIdea(idea);
                } else {
                    throw new Error('activity: idea is required');
                }
            }],

            socialInteraction: ['$stateParams', 'SocialInteractionService', function ($stateParams, SocialInteractionService) {
                if ($stateParams.socialInteraction) {
                    return SocialInteractionService.getSocialInteraction($stateParams.socialInteraction);
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
                    return ActivityService.getInvitationStatus($stateParams.activity);
                } else {
                    return [];
                }
            }],

            activity: ['$rootScope', '$stateParams', 'ActivityService', 'socialInteraction', '$q',
                function ($rootScope, $stateParams, ActivityService, socialInteraction, $q) {
                    if (socialInteraction && socialInteraction.activity) {
                        return socialInteraction.activity;
                    }
                    if ($stateParams.activity) {
                        return ActivityService.getActivity($stateParams.activity).catch(function (err) {
                            return $q.reject(err.status === 403 ? 'clientmsg.error.activity.notParticipating' : err);
                        });
                    } else {
                        return ActivityService.getDefaultActivity($stateParams.idea, {campaignId: $stateParams.campaignId});
                    }
                }],


            activityEvents: ['ActivityService', 'activity', function (ActivityService, activity) {

                if (!activity.id) {
                    return [];
                }

                return ActivityService.getActivityEvents({
                    'filter[activity]': activity.id,
                    sort: 'start'
                }).then(function(events) {
                    // replace the unpopulated event.activity with the full activity object
                    _.forEach(events, function(event) {event.activity = activity;});
                    return events;
                });
            }],

            healthCoachEvent: ['$state', 'ActivityService', 'UserService', 'campaign', 'socialInteraction', 'activity', 'activityEvents',
                function ($state, ActivityService, UserService, campaign, socialInteraction, activity, activityEvents) {

                    if (!campaign) {
                        return;
                    }

                    function getEventName() {

                        // workaround until we find a fix to have 2 distinct activity states with a dhc/dcm parent
                        if ($state.$current.parent && $state.$current.parent.toString() === 'dhc') { // dhc

                            var hasDueEvents = _.filter(activityEvents, function (event) {
                                    return moment().diff((event).end) > 0;
                                }).length > 0;

                            if (socialInteraction && socialInteraction.__t === 'Recommendation') {
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
            'campaign', 'idea', 'activity', 'activityEvents', 'socialInteraction', 'existingCampaignInvitation', 'invitationStatus',
            function ($scope, $rootScope, $state, $stateParams, $timeout, localStorageService,
                      UserService, ActivityService, SocialInteractionService, HealthCoachService, CampaignService, healthCoachEvent,
                      campaign, idea, activity, activityEvents, socialInteraction, existingCampaignInvitation, invitationStatus) {


                if (socialInteraction && existingCampaignInvitation && socialInteraction.id !== existingCampaignInvitation.id) {
                    console.log("this should never happen: if we have a socialInteracion and an existingCampaignInvitation, they should be the same");
                }

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
                $scope.isInvitation = socialInteraction && socialInteraction.__t === 'Invitation';
                $scope.isRecommendation = socialInteraction && socialInteraction.__t === 'Recommendation';
                $scope.isDcm = $state.current.name.indexOf('dcm') !== -1;
                $scope.isDhc = $state.current.name.indexOf('dhc') !== -1;
                $scope.isNewActivity = !$scope.isScheduled && !$scope.isRecommendation;
                $scope.pageTitle = _getPageTitle();

                $scope.socialInteraction = socialInteraction || existingCampaignInvitation;

                if (!$scope.socialInteraction) {
                    $scope.socialInteraction = {
                        author: UserService.principal.getUser(),
                        authorType: $scope.isCampaignLead ? 'campaignLead' : 'user',
                        __t: 'Invitation',
                        activity: activity.id,
                        idea: $scope.idea.id
                    };
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
                        $state.go('dcm.home', {campaignId: campaign.id});
                    } else {
                        $state.go('dhc.game', {view: "", campaignId: campaign.id});
                    }
                };

                $scope.dismiss = function dismiss() {
                    SocialInteractionService.deleteSocialInteraction($scope.socialInteraction.id, {reason: 'denied', mode: 'participate'})
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

                        var invitation = $scope.socialInteraction;
                        invitation.activity = savedActivity.id;

                        // in the case where this is a newly planned event by a participant, we
                        // have in $scope.socialInteraction the initial recommendation, the user clicked on
                        // for saving
                        if (invitation.__t === 'Recommendation') {
                            invitation = {
                                author: UserService.principal.getUser(),
                                authorType: $scope.isCampaignLead ? 'campaignLead' : 'user',
                                __t: 'Invitation',
                                activity: savedActivity.id,
                                idea: $scope.idea.id
                            };
                        }

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

                            });
                        } else {
                            return _finalCb();
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
                    if (_.isEqual(newActivity, old) && $scope.isScheduled && $scope.events.length > 0) {
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
                        $scope.events = events;


                        // publishTo/publishFrom

                        if($scope.isDcm) {
                            _updatePublishDates($scope.socialInteraction, campaign, events);
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
                    } else if ($scope.isCampaignLead) {
                        return 'NewCampaignActivity';
                    } else if (!$scope.isScheduled && !$scope.socialInteraction) {
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

                        if ($scope.isDcm) {
                            activityController.inviteOthers = 'all';
                            $scope.inviteLocked = true;
                        }
                    }
                    activityController.inviteOthers = activityController.inviteOthers || 'none';

                    // exclude all already invited users, me as the owner, and all campaignLeads from this campaign
                    $scope.usersExcludedForInvitation = $scope.invitedUsers.concat($scope.activity.owner);

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

                }
            }
        ]);

})();