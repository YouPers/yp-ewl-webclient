(function () {
    'use strict';


    angular.module('yp.admin')

        .constant('enums', {

            // used in activity & cockpit
            activityFields: [
                'awarenessAbility',
                'timeManagement',
                'workStructuring',
                'physicalActivity',
                'nutrition',
                'leisureActivity',
                'breaks',
                'relaxation',
                'socialInteraction'
            ]
        })

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('admin-activity', {
                        templateUrl: "layout/admin-default.html",
                        access: accessLevels.admin
                    })

                    .state('admin-activity.list', {
                        url: "/admin/activities?tab&page",
                        access: accessLevels.admin,
                        views: {
                            content: {
                                templateUrl: "admin/activity/activities.html",
                                controller: 'ActivitiesCtrl'
                            }
                        },
                        resolve: {
                            allActivities: ['ActivityService', function (ActivityService) {
                                return ActivityService.getActivities();
                            }],
                            activityPlans: ['ActivityService', function (ActivityService) {
                                return ActivityService.getActivityPlans();
                            }],
                            recommendations: ['ActivityService', function (ActivityService) {
                                return ActivityService.getRecommendations();
                            }],
                            topStressors: ['AssessmentService', function (AssessmentService) {
                                return AssessmentService.topStressors('525faf0ac558d40000000005');
                            }],
                            assessment: ['AssessmentService', function (AssessmentService) {
                                return AssessmentService.getAssessment('525faf0ac558d40000000005');
                            }]
                        }
                    })
                    .state('admin-activity.edit', {
                        url: "/admin/activities/:activityId/admin?tab&page",
                        views: {
                            content: {
                                templateUrl: "admin/activity/activity-admin.html",
                                controller: "ActivityAdminCtrl",
                            }
                        },
                        access: accessLevels.admin,
                        resolve: {
                            activity: ['ActivityService', '$stateParams', function (ActivityService, $stateParams) {
                                return ActivityService.getActivity($stateParams.activityId);
                            }],
                            assessment: ['AssessmentService', function (AssessmentService) {
                                return AssessmentService.getAssessment('525faf0ac558d40000000005');
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('admin/activity/activity');

            }])

        .controller('ActivitiesCtrl', ['$scope', '$filter', 'allActivities', 'activityPlans',
            'recommendations', 'topStressors', 'assessment', 'ActivityService', 'ProfileService',
            function ($scope, $filter, allActivities, activityPlans, recommendations, topStressors, assessment, ActivityService, ProfileService) {
                var user = $scope.principal.getUser();

                $scope.buttonsShown = {};

                var campaigns = [];

                if (user.campaign) {
                    campaigns = [user.campaign.id];
                }

                $scope.hasRecommendations = (recommendations.length > 0);

                allActivities.enrichWithUserData(activityPlans, recommendations, campaigns, user.profile.userPreferences);

                $scope.activities = allActivities;
                $scope.filteredActivities = allActivities;

                _.forEach(topStressors, function (stressor) {
                    stressor.title = assessment.questionLookup[stressor.question] &&  assessment.questionLookup[stressor.question].title;
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
                        allActivities.enrichWithUserData(activityPlans, newRecs, campaigns, user.profile.userPreferences);
                        $scope.filteredActivities = $filter('ActivityListFilter')($scope.activities, $scope.query);
                    });

                };

                $scope.gotoActivityDetail = function (activity) {
                    // goto detail state, keep active tab around as stateparameter
                    $scope.$state.go('activityPlan', {activityId: activity.id, tab: $scope.$stateParams.tab, page: $scope.currentPage});
                };

                $scope.reject = function (activity, event) {
                    event.stopPropagation();
                    activity.rejected = true;

                    // add it to the collection of rejected Activities in the profile
                    user.profile.userPreferences.rejectedActivities.push({activity: activity.id, timestamp: new Date()});
                    // remove it from the starred list
                    _.remove(user.profile.userPreferences.starredActivities, function (starred) {
                        return starred.activity === activity.id;
                    });
                    // update the filtered list, so it does not show up anymore in the display
                    $scope.filteredActivities = $filter('ActivityListFilter')($scope.activities, $scope.query);
                    // save the profile
                    ProfileService.putProfile(user.profile);
                };

                $scope.toggleStar = function (activity, event) {
                    event.stopPropagation();

                    if (activity.starred) {
                        _.remove(user.profile.userPreferences.starredActivities, function (starred) {
                            return starred.activity === activity.id;
                        });
                    } else {
                        user.profile.userPreferences.starredActivities.push({activity: activity.id, timestamp: new Date()});
                    }
                    activity.starred = !activity.starred;

                    if ($scope.principal.isAuthenticated()) {
                        ProfileService.putProfile(user.profile);
                    }

                };
                $scope.countStarredActivities = function () {
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

                // initialize correct Tab from state Params
                if ($scope.$stateParams.tab) {
                    $scope.query.subset = $scope.$stateParams.tab;
                }

                $scope.setListTab = function setListTab(tabId) {
                    $scope.$state.go('activitylist', {tab: tabId});
                };

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

                // if we do not get a query, return the full list
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
                                (query.subset === 'recommendations' && activity.isRecommended && out.length < 5) ||
                                (query.subset === 'starred' && activity.starred)) &&
                            (!query.fulltext || (activity.title.toUpperCase() + activity.number.toUpperCase()).indexOf(query.fulltext.toUpperCase()) !== -1) &&
                            (!activity.rejected)
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