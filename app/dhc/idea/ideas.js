(function () {
    'use strict';

    angular.module('yp.dhc')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('idea', {
                        templateUrl: "layout/default.html",
                        access: accessLevels.all
                    })
                    .state('idea.list', {
                        url: "/ideas?status",
                        reloadOnSearch: false,
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dhc/idea/ideas.html',
                                controller: 'IdeasController'
                            }
                        },
                        resolve: {
                            ideasFromActivities: ['ActivityService', function(ActivityService) {
                                return ActivityService.getActivities({ populate: 'owner' }).then(function(activities) {
                                    return _.map(activities, function(activity) {

                                        var idea = activity.idea;
                                        idea.activity = activity;
                                        idea.status = activity.status === 'active' ? 'active' : 'done';
                                        return idea;
                                    });
                                });
                            }],
                            ideasFromProfile: ['UserService', function(UserService) {
                                return UserService.getProfiles({ populate: 'prefs.rejectedIdeas prefs.starredIdeas' }).then(function(profiles) {
                                    if(!profiles || profiles.length !== 1) {
                                        throw new Error('no profile or not unique');
                                    }

                                    var rejected = profiles[0].prefs.rejectedIdeas || [];

                                    _.forEach(rejected, function(idea) {
                                        idea.status = 'starred';
                                    });

                                    var starred = profiles[0].prefs.starredIdeas || [];

                                    _.forEach(starred, function(idea) {
                                        idea.status = 'rejected';
                                    });
                                    return rejected.concat(starred);
                                });
                            }],
                            ideasFromSocialInteractions: ['SocialInteractionService', function(SocialInteractionService) {
                                return SocialInteractionService.getSocialInteractions().then(function (socialInteractions) {
                                    return _.map(_.filter(socialInteractions, function(si) {
                                        return si.__t === 'Invitation' || si.__t === 'Recommendation';
                                    }), function(socialInteraction) {
                                        var idea = socialInteraction.idea || socialInteraction.activity.idea;
                                        idea.status = socialInteraction.__t === 'Invitation' ? 'invited' : 'recommended';
                                        idea.socialInteraction = socialInteraction;
                                        return idea;
                                    });
                                });
                            }]

                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/idea/idea');
            }])

        .controller('IdeasController', [ '$scope', '$rootScope', '$stateParams', '$location', '$window', '$timeout',
            'ideasFromActivities', 'ideasFromProfile', 'ideasFromSocialInteractions',
            function ($scope, $rootScope, $stateParams, $location, $window, $timeout, ideasFromActivities, ideasFromProfile, ideasFromSocialInteractions) {

                $scope.stati = ['active', 'done', 'starred', 'rejected', 'invited', 'recommended', 'offered'];

                $scope.statusClasses = {
                    active: 'fa-edit',
                    done: 'fa-check-square-o',
                    starred: 'fa-star-o',
                    rejected: 'fa-trash-o',
                    invited: 'fa-envelope-o',
                    recommended: 'fa-sun-o',
                    offered: 'fa-users'
                };

                function filterIdeas(status) {
                    var ideas = ideasFromSocialInteractions
                        .concat(ideasFromActivities)
                        .concat(ideasFromProfile);
                    return _.filter(ideas, function (idea) {

                        if(status === 'offered') {
                            return idea.status === 'invited' || idea.status === 'recommended';
                        }

                        return idea.status === status;
                    });
                }

                function init() {
                    $scope.status = $location.search().status || 'active';
                    $scope.ideas = filterIdeas($scope.status);
                }

                init();

                $scope.$watch('status', function(newValue, oldValue) {
                    $location.search({status: newValue});
                });

                $scope.$watch(function () {
                    return $location.search().status;
                }, function (newValue, oldValue) {
                    if($location.search().status) {
                        init();
                    }
                });

                $scope.isActive = function isActive(status) {
                    return status === $location.search().status;
                };
            }
        ]);

}());