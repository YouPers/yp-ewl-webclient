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
                                controller: 'ActivityController'
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
                                    return ActivityService.getDefaultActivity($stateParams.idea, { populate: 'idea' });
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

                $scope.idea = idea;
                $scope.activity = activity;
                $scope.socialInteraction = socialInteraction;

                $scope.isOwned = activity && activity.owner === UserService.principal.getUser().id;

                var mode = $stateParams.mode;

                if (!mode) {
                    if (socialInteraction) {
                        mode = socialInteraction.__t.toLowerCase();
                    } else if (activity && activity.id) {
                        mode = activity.isParticipant() ? 'view' : 'join';
                    } else {
                        mode = 'schedule';
                    }
                }

                $scope.mode = mode;

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
                }, 1000);

                $scope.$watch('activity.mainEvent', validateActivity, true);

                $scope.saveActivity = function saveActivity() {

                    ActivityService.savePlan($scope.activity).then(function (savedActivity) {
                        $rootScope.$emit('clientmsg:success', 'activityPlan.save');

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