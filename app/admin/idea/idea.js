(function () {
    'use strict';


    angular.module('yp.admin')


        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider

                    .state('admin.idea-list', {
                        url: "/ideas?tab&page&topic",
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
                            topics: ['Restangular', function (Restangular) {
                                return Restangular.all('topics').getList();
                            }]

                        }
                    })
                    .state('admin.idea-edit', {
                        url: "/ideas/:ideaId/admin?tab&page&topic",
                        views: {
                            content: {
                                templateUrl: "admin/idea/idea-admin.html",
                                controller: "IdeaController"
                            }
                        },
                        access: accessLevels.admin,
                        resolve: {
                            idea: ['ActivityService', '$stateParams', function (ActivityService, $stateParams) {
                                if ($stateParams.ideaId) {
                                    return ActivityService.getIdea($stateParams.ideaId);
                                } else {
                                    return ActivityService.newIdea($stateParams.campaignId);
                                }
                            }],
                            campaign: function() {
                                return null;
                            },
                            topics: ['TopicService', function(TopicService) {
                                return TopicService.getTopics();
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('components/idea/idea');

            }])

        .controller('IdeasAdminCtrl', ['$scope', '$filter', 'allIdeas', 'ActivityService', 'ProfileService', 'topics',
            function ($scope, $filter, allIdeas, ActivityService, ProfileService, topics) {
                var user = $scope.principal.getUser();

                $scope.buttonsShown = {};

                var campaigns = [];

                if (user.campaign) {
                    campaigns = [user.campaign.id];
                }

                var recommendations = [];

                if ($scope.$stateParams.topic) {
                    $scope.currentTopic = $scope.$stateParams.topic;
                }

                topics.byId = _.indexBy(topics, 'id');
                $scope.topics = topics;

                $scope.$watch('currentTopic', function (newValue, oldValue) {
                    if (newValue) {
                        $scope.query.topic = newValue;
                        var params = {
                            limit: 1000,
                            topic: newValue,
                            dontStore: true
                        };

                        ActivityService.getRecommendations(params)
                            .then(function (recs) {
                                allIdeas.enrichWithUserData([], recs, campaigns, user.profile.prefs);
                            });

                    }
                });


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
                    },
                    topic: null
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

                        if (
                            (allTopics || _.any(idea.topics, function (value) {
                                return query.topic === value;
                            })) &&
                            (allExecutiontypes || query.executiontype[idea.defaultexecutiontype]) &&
                            (allTimes || !idea.defaultduration || query.time[durationMapping(idea.defaultduration)]) &&
                            (!query.fulltext || ((idea.title && idea.title.toUpperCase()) +  (idea.description && idea.description.toUpperCase())+  (idea.text && idea.text.toUpperCase()) + idea.number.toUpperCase()).indexOf(query.fulltext.toUpperCase()) !== -1) &&
                            (!query.emptyTexts || idea.text === '' || idea.text === 'MISSING TRANSLATION')
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
        }])

        .controller('IdeaAdminController', ['$scope', '$rootScope',  'ActivityService', 'AssessmentService', 'TopicService',
            function ($scope, $rootScope, ActivityService, AssessmentService, TopicService) {

                $scope.assessment = {questions: []};
                $scope.$watch('idea.topics', function (newValue, oldValue) {
                        $scope.selectedTopics = _.filter($scope.topics, function (topic) {
                            return _.contains($scope.idea.topics, topic.id);
                        }, true);
                    }
                );

                $scope.$watch('currentTopic', function (newVal, oldVal) {
                    if (newVal) {
                        AssessmentService.getAssessment(newVal)
                            .then(function (assessment) {
                                _.forEach(assessment.questions, function (question) {
                                    if (!_.any($scope.idea.recWeights, function (recWeight) {
                                        return recWeight[0] === question.id;
                                    })) {
                                        $scope.idea.recWeights.push([question.id, 0, 0]);
                                        $scope.idea.uiRecWeights = $scope.idea.getRecWeightsByQuestionId();
                                    }
                                });
                                $scope.assessment = assessment;
                            });
                    }
                });

                $scope.addOffer = function addOffer(topic) {

                    var week = 1;
                    var weekday = 'MO';

                    topic.templateCampaignOffers.push({
                        idea: $scope.idea.id,
                        type: 'Recommendation',
                        week: week,
                        weekday: weekday
                    });
                };

                $scope.removeOffer = function removeOffer(topic, index) {
                    topic.templateCampaignOffers.splice(index, 1);
                };

                $scope.saveTopic = function saveTopic(topic) {
                    TopicService.putTopic(topic).then(function () {
                        $rootScope.$emit('clientmsg:success', 'templateCampaign.save');
                    });
                };

                // Weighting to generate recommendation of idea based on answers of this assessment
                // initialize weights if they do not yet exist
                if (!$scope.idea.recWeights || $scope.idea.recWeights.length === 0) {
                    $scope.idea.recWeights = [];
                }

                // backend does not store emtpy (0/0) weights, but our UI needs an empty record for each question
                // so we add one for all questions that don't have one
                $scope.idea.uiRecWeights = $scope.idea.getRecWeightsByQuestionId();

            }]);


}());