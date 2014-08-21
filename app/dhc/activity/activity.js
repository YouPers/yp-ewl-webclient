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

                            activity: ['$stateParams', 'ActivityService', function ($stateParams, ActivityService) {
                                if ($stateParams.activity) {
                                    return  ActivityService.getActivity($stateParams.activity);
                                } else {
                                    return ActivityService.getDefaultActivity($stateParams.idea);
                                }
                            }],

                            socialInteraction: ['$stateParams', 'SocialInteractionService', function ($stateParams, SocialInteractionService) {
                                if ($stateParams.socialInteraction) {
                                    return  SocialInteractionService.getSocialInteraction($stateParams.socialInteraction);
                                } else {
                                    return undefined;
                                }
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/activity/activity');
            }])

        .controller('ActivityController', [ '$scope', '$rootScope', '$state', '$stateParams',
            'UserService', 'ActivityService', 'SocialInteractionService',
            'campaign', 'idea', 'activity', 'socialInteraction',
            function ($scope, $rootScope, $state, $stateParams,
                      UserService, ActivityService, SocialInteractionService,
                      campaign, idea, activity, socialInteraction) {

                var activityController = this;

                $scope.idea = idea;
                $scope.activity = activity;

                if(socialInteraction) {
                    $scope.socialInteraction = socialInteraction;
                    $scope.socialInteractionEvent = activity ? activity.mainEvent : {} ;
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


                $scope.invitedUsers = [];
                $scope.onUserSelected = function onUserSelected(user) {
                    $scope.invitedUsers.push(user);
                };
                $scope.removeInvitedUser = function (user) {
                    _.remove($scope.invitedUsers, { id: user.id });
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
                $scope.$watch('activity', function() {
                    $scope.dirty = true;
                }, true);

                $scope.dismiss = function dismiss() {
                    SocialInteractionService.deleteSocialInteraction($scope.socialInteraction.id).then(function (result) {
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
                        if(inviteAll || $scope.invitedUsers.length > 0) {

                            var invitation = {
                                author: UserService.principal.getUser().id,
                                refDocs: [{
                                    docId: $scope.activity.id,
                                    model: 'Activity'
                                }]
                            };

                            if(inviteAll) {
                                invitation.targetSpaces = [{
                                    type: 'campaign',
                                    targetId: campaign.id
                                }];
                            } else {
                                invitation.targetSpaces = [];
                                _.forEach($scope.invitedUsers, function (user) {
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