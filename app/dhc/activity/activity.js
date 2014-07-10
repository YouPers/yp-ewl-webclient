(function () {
    'use strict';

    angular.module('yp.dhc')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('activity', {
                        templateUrl: "layout/default.html",
                        access: accessLevels.all
                    })
                    .state('activity.content', {
                        url: "/activity/:id?idea&mode",
                        reloadOnSearch: false,
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dhc/activity/activity.html',
                                controller: 'ActivityController'
                            }
                        },
                        resolve: {

                            activity: ['$stateParams', '$location', 'ActivityService', function($stateParams, $location, ActivityService) {
                                if($stateParams.id) {
                                    return  ActivityService.getActivity($stateParams.id);
                                } else if($location.search().idea) {
                                    return ActivityService.getDefaultActivity($location.search().idea, { populate: 'idea' });
                                } else {
                                    throw new Error('activity: either the id of an activity or an idea is required')
                                }
                            }],

                            idea: ['$location', 'ActivityService', function($location, ActivityService) {
                                var idea = $location.search().idea;
                                return !idea ? undefined : ActivityService.getIdea(idea);
                            }],

                            activitiesParticipated: ['ActivityService', 'UserService', function(ActivityService, UserService) {

                                var user = UserService.principal.getUser();

                                return ActivityService.getActivities({ populate: 'idea owner joiningUsers' }).then(function(activities) {
                                    _.forEach(activities, function (activity) {
                                        activity.status = activity.owner === user.id ? 'owned' : 'joined'
                                    });
                                    return activities;
                                });
                            }],
                            activitiesFromInvitations: ['SocialInteractionService', function(SocialInteractionService) {

                                return SocialInteractionService.getInvitations().then(function (invitations) {
                                    return _.map(invitations, function(invitation) {
                                        var activity = invitation.activity;
                                        activity.socialInteraction = invitation;
                                        activity.status = 'invited';
                                        return activity;
                                    })
                                });
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/activity/activity');
            }])

        .controller('ActivityController', [ '$scope', '$rootScope', '$stateParams', '$location', '$window', '$timeout',
            'activity', 'activitiesParticipated', 'activitiesFromInvitations', 'idea',
            function ($scope, $rootScope, $stateParams, $location, $window, $timeout,
                      activity, activitiesParticipated, activitiesFromInvitations, idea) {



                var activities = $scope.activities = activitiesParticipated.concat(activitiesFromInvitations);


                $scope.activity = activity;
                $scope.idea = idea = idea ? idea : activity.idea;

                if($location.search().mode) {
                    $scope.mode = $location.search().mode;
                } else if($stateParams.id) {
                    $scope.mode = 'view';
                } else if(activities.length > 1) {
                    $scope.mode = 'list';
                } else if(activities.length === 1) {
                    $scope.activity = activities[0];
                    $scope.mode = 'view';
                } else {
                    $scope.mode = 'edit';
                }

                $scope.$watch('mode', function(newValue, oldValue) {
                    $location.search({mode: newValue, idea: idea.id});
                });

                $scope.$watch(function () {
                    return $location.search();
                }, function (newValue, oldValue) {
                    if($location.search().mode) {
                        $scope.mode = $location.search().mode;
                    }
                });

                $scope.onSelect = function (activity) {
                    $scope.activity = activity;
                    $scope.mode = 'view';
                };

            }
        ]);

}());