(function () {
    'use strict';


    angular.module('yp.activity')

        .controller('ActivityListCtrl', ['$scope', '$filter', 'allActivities', 'activityPlans',
                    'recommendations', 'topStressors', 'assessment', 'ActivityService', 'ProfileService',
            function ($scope, $filter, allActivities, activityPlans,
                      recommendations, topStressors, assessment, ActivityService, ProfileService) {

                // mock campaigns, that this user has an active goal for, should be loaded from server later...
                var campaigns = [];

                if ($scope.principal.getUser().campaign) {
                    campaigns = [$scope.principal.getUser().campaign.id];
                }

                $scope.hasRecommendations = (recommendations.length > 0);

                var starredActs = $scope.principal &&
                    $scope.principal.getUser() &&
                    $scope.principal.getUser().profile.userPreferences.starredActivities || [];

                allActivities.enrichWithUserData(activityPlans, recommendations, campaigns, starredActs);

                $scope.activities = allActivities;
                $scope.filteredActivities = allActivities;

                _.forEach(topStressors, function (stressor) {
                    stressor.title = assessment.questionLookup[stressor.question].title;
                });
                $scope.topStressors = topStressors;

                $scope.focusOnStressor = function (stressor) {
                    var focusQuestion = null;
                    if (stressor.focussed) {
                        focusQuestion = stressor.question;
                        _.forEach($scope.topStressors, function (myStressor) {
                            if (myStressor !== stressor) {
                                myStressor.focussed = false;
                            }
                        });
                    }
                    ActivityService.getRecommendations(focusQuestion).then(function (newRecs) {
                        allActivities.enrichWithUserData(activityPlans, newRecs, campaigns, starredActs);
                        $scope.filteredActivities = $filter('ActivityListFilter')($scope.activities, $scope.query);
                    });

                };

                $scope.gotoActivityDetail = function (activity) {
                    // goto detail state, keep active tab around as stateparameter
                    $scope.$state.go('activityPlan', {activityId: activity.id, tab: $scope.$stateParams.tab, page: $scope.currentPage});
                };


                $scope.toggleStar = function (activity, event) {
                    event.stopPropagation();
                    activity.starred = !activity.starred;
                    var user = $scope.principal.getUser();
                    if (!user.preferences) {
                        user.preferences = {};
                    }
                    if (!user.profile.userPreferences.starredActivities) {
                        user.profile.userPreferences.starredActivities = [];
                    }

                    if (_.contains(user.profile.userPreferences.starredActivities, activity.id)) {
                        _.remove(user.profile.userPreferences.starredActivities, function (id) {
                            return id === activity.id;
                        });
                    } else {
                        user.profile.userPreferences.starredActivities.push(activity.id);
                    }
                    ProfileService.putProfile(user.profile);

                };
                $scope.countStarredActivities = function () {
                    //TODO: consider initialization at an earlier point to prevent checks like this
                    if (_.isUndefined($scope.principal.getUser())) {
                        return '';
                    }
                    return _.size($scope.principal.getUser().profile.userPreferences.starredActivities);
                };

                $scope.query = {
                    subset: 'recommendations',
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
                    topic: {
                        workLifeBalance: true,
                        physicalFitness: false,
                        nutrition: false,
                        mentalFitness: false
                    },
                    fulltext: "",
                    executiontype: {
                        self: false,
                        group: false
                    }
                };

                function setListTab(tabId) {
                    $scope.$state.go('activitylist', {tab: tabId});
                }

                // initialize correct Tab from state Params
                if ($scope.$stateParams.tab) {
                    $scope.query.subset = $scope.$stateParams.tab;
                }

                $scope.setListTab = setListTab;


                $scope.pageSize = 20;
                $scope.maxSize = 8;

                $scope.currentPage = $scope.$stateParams.page || 1;

                // watch for changes on the query object and reapply filter, use deep watch=true
                // whenever the query changes, update the filtered List of activities to the new query and
                // jump back to first page of pagination
                $scope.$watch('query', function (newQuery) {
                    // $scope.currentPage = 1;
                    $scope.filteredActivities = $filter('ActivityListFilter')($scope.activities, $scope.query);
                }, true);
            }])


    /**
     * filters an array of activities by a given query, returns an array with all activities that match the query
     */
        .filter('ActivityListFilter', [function () {
            return function (activities, query) {
                var out = [],
                    allClusters = true,
                    allTopics = true,
                    allTimes = true,
                    allRatings = true,
                    allExecutiontypes = true,
                    subSetAll = true,
                    ratingsMapping = ['none', 'one', 'two', 'three', 'four', 'five'],
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

                // if we do not get a query, we return the full set of answers
                if (!query) {
                    return activities;
                }

                angular.forEach(query.cluster, function (value, key) {
                    if (value) {
                        allClusters = false;
                    }
                });

                angular.forEach(query.topic, function (value, key) {
                    if (value) {
                        allTopics = false;
                    }
                });

                angular.forEach(query.rating, function (value, key) {
                    if (value) {
                        allRatings = false;
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

                if (query.subset !== 'all') {
                    subSetAll = false;
                }

                angular.forEach(activities, function (activity, key) {

                        if ((allClusters || _.any(activity.fields, function (value) {
                            return query.cluster[value];
                        })) &&
                            (allTopics || _.any(activity.topics, function (value) {
                                return query.topic[value];
                            })) &&
                            (allRatings || query.rating[ratingsMapping[activity.rating]]
                                ) &&
                            (allExecutiontypes || query.executiontype[activity.defaultexecutiontype]) &&
                            (allTimes || !activity.defaultduration || query.time[durationMapping(activity.defaultduration)]
                                ) &&
                            (subSetAll || (query.subset === 'campaign' && activity.isCampaign) ||
                                (query.subset === 'recommendations' && activity.isRecommended) ||
                                (query.subset === 'starred' && activity.starred)) &&
                            (!query.fulltext || (activity.title.toUpperCase() + activity.number.toUpperCase()).indexOf(query.fulltext.toUpperCase()) !== -1)
                            ) {
                            out.push(activity);
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