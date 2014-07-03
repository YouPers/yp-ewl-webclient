(function () {
    'use strict';


    angular.module('yp.admin')


        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('admin-idea', {
                        templateUrl: "layout/admin-default.html",
                        access: accessLevels.admin
                    })

                    .state('admin-idea.list', {
                        url: "/admin/ideas?tab&page",
                        access: accessLevels.admin,
                        views: {
                            content: {
                                templateUrl: "admin/idea/ideas.html",
                                controller: 'IdeasAdminCtrl'
                            }
                        },
                        resolve: {
                            allIdeas: ['ActivityService', function (ActivityService) {
                                return ActivityService.getIdeas();
                            }],
                            recommendations: ['ActivityService', function (ActivityService) {
                                return ActivityService.getRecommendations();
                            }]
                        }
                    })
                    .state('admin-idea.edit', {
                        url: "/admin/ideas/:ideaId/admin?tab&page",
                        views: {
                            content: {
                                templateUrl: "admin/idea/idea-admin.html",
                                controller: "IdeaAdminCtrl"
                            }
                        },
                        access: accessLevels.admin,
                        resolve: {
                            idea: ['ActivityService', '$stateParams', function (ActivityService, $stateParams) {
                                return ActivityService.getIdea($stateParams.ideaId);
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('admin/idea/idea');

            }])

        .controller('IdeasAdminCtrl', ['$scope', '$filter', 'allIdeas',
            'recommendations', 'ActivityService', 'ProfileService',
            function ($scope, $filter, allIdeas, recommendations,  ActivityService, ProfileService) {
                var user = $scope.principal.getUser();

                $scope.buttonsShown = {};

                var campaigns = [];

                if (user.campaign) {
                    campaigns = [user.campaign.id];
                }

                $scope.hasRecommendations = (recommendations.length > 0);

                allIdeas.enrichWithUserData([], recommendations, campaigns, user.profile.prefs);

                $scope.ideas = allIdeas;
                $scope.filteredIdeas = allIdeas;

                $scope.reject = function (idea, event) {
                    event.stopPropagation();
                    idea.rejected = true;

                    // add it to the collection of rejected Ideas in the profile
                    user.profile.prefs.rejectedIdeas.push({idea: idea.id, timestamp: new Date()});
                    // remove it from the starred list
                    _.remove(user.profile.prefs.starredIdeas, function (starred) {
                        return starred.idea === idea.id;
                    });
                    // update the filtered list, so it does not show up anymore in the display
                    $scope.filteredIdeas = $filter('IdeaListFilter')($scope.ideas, $scope.query);
                    // save the profile
                    ProfileService.putProfile(user.profile);
                };

                $scope.toggleStar = function (idea, event) {
                    event.stopPropagation();

                    if (idea.starred) {
                        _.remove(user.profile.prefs.starredIdeas, function (starred) {
                            return starred.idea === idea.id;
                        });
                    } else {
                        user.profile.prefs.starredIdeas.push({idea: idea.id, timestamp: new Date()});
                    }
                    idea.starred = !idea.starred;

                    if ($scope.principal.isAuthenticated()) {
                        ProfileService.putProfile(user.profile);
                    }

                };
                $scope.countStarredIdeas = function () {
                    if (_.isUndefined($scope.principal.getUser())) {
                        return '';
                    }
                    return _.size($scope.principal.getUser().profile.prefs.starredIdeas);
                };

                $scope.query = {
                    cluster: {
                    },
                    rating: {
                        five: false,
                        four: false,
                        three: false,
                        two: false,
                        one: false
                    },
                    time: {
                        t15: false,
                        t30: false,
                        t60: false,
                        more: false
                    },
                    fulltext: "",
                    executiontype: {
                        self: false,
                        group: false
                    }
                };

                $scope.pageSize = 20;
                $scope.maxSize = 8;

                $scope.currentPage = $scope.$stateParams.page || 1;

                // watch for changes on the query object and reapply filter, use deep watch=true
                // whenever the query changes, update the filtered List of ideas to the new query and
                // jump back to first page of pagination
                $scope.$watch('query', function (newQuery) {
                    // $scope.currentPage = 1;
                    $scope.filteredIdeas = $filter('IdeaListFilter')($scope.ideas, $scope.query);
                }, true);
            }])


    /**
     * filters an array of ideas by a given query, returns an array with all ideas that match the query
     */
        .filter('IdeaListFilter', [function () {
            return function (ideas, query) {
                var out = [],
                    allTopics = true,
                    allTimes = true,
                    allExecutiontypes = true,
                    durationMapping = function (duration) {
                        if (duration < 15) {
                            return 't15';
                        } else if (duration <= 30) {
                            return 't30';
                        } else if (duration <= 60) {
                            return 't60';
                        } else {
                            return 'more';
                        }
                    };

                // if we do not get a query, return the full list
                if (!query) {
                    return ideas;
                }

                angular.forEach(query.topic, function (value, key) {
                    if (value) {
                        allTopics = false;
                    }
                });

                angular.forEach(query.time, function (value, key) {
                    if (value) {
                        allTimes = false;
                    }
                });

                angular.forEach(query.executiontype, function (value, key) {
                    if (value) {
                        allExecutiontypes = false;
                    }
                });

                angular.forEach(ideas, function (idea, key) {

                        if ((allTopics || _.any(idea.topics, function (value) {
                                return query.topic[value];
                            })) &&
                            (allExecutiontypes || query.executiontype[idea.defaultexecutiontype]) &&
                            (allTimes || !idea.defaultduration || query.time[durationMapping(idea.defaultduration)]
                                )  &&
                            (!query.fulltext || (idea.title.toUpperCase() + idea.number.toUpperCase()).indexOf(query.fulltext.toUpperCase()) !== -1) &&
                            (!idea.rejected)
                            ) {
                            out.push(idea);
                        }
                    }
                );
                return out;

            };
        }]
        )

        .filter('startFrom', [function () {
            return function (input, start) {
                start = +start; //parse to int
                return input.slice(start);
            };
        }]);


}());