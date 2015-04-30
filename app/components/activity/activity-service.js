(function () {
    'use strict';

    angular.module('yp.components.activity')

        .factory('ActivityService', ['$http', 'Restangular', '$q', 'UserService', '$rootScope', 'localStorageService',
            function ($http, Restangular, $q, UserService, $rootScope, localStorageService) {
                var ideas = Restangular.all('ideas');
                var activities = Restangular.all('activities');
                var activityEvents = Restangular.all('activityevents');

                var ideaCache = {};
                var ideaCachePending = {};

                $rootScope.$on('$translateChangeSuccess', function () {
                    $rootScope.$log.log('IdeaService: resetting IdeaCache');
                    ideaCache = {};
                });

                var _populateIdeas = function (object) {
                    // make it work for arrays and single objects
                    var objects = Array.isArray(object) ? object : [object];

                    var usersCampaign = $rootScope.$stateParams.campaignId ||
                        (UserService.principal.getUser().campaign && UserService.principal.getUser().campaign.id);

                    // we have to wait for all pending requests that contain ids that we need
                    var promisesToWaitFor = [];

                    // determine whether we need to fetch anything from server or wait for something that is already
                    // being fetched
                    var ideaIdsToFetch = [];
                    _.forEach(objects, function (obj) {
                        if (obj.idea && !_.isObject(obj.idea) && !ideaCache[obj.idea]) {
                            if (ideaCachePending[obj.idea]) {
                                promisesToWaitFor.push(ideaCachePending[obj.idea]);
                            } else {
                                ideaIdsToFetch.push(obj.idea);
                            }
                        }
                    });

                    /**
                     * populate objects synchronously from Cache, assumes that all needed objects are in the cache
                     * @returns {*}
                     * @private
                     */
                    function _populateFromCache() {
                        _.forEach(objects, function (obj) {
                            if (obj.idea && !_.isObject(obj.idea)) {
                                obj.idea = ideaCache[obj.idea];
                            }
                        });

                        // when we first got an array we return array, otherwise object
                        if (Array.isArray(object)) {
                            return objects;
                        } else {
                            return objects[0];
                        }
                    }

                    // are there some ids that are not in the cache and are not already being fetched?
                    if (ideaIdsToFetch.length > 0) {
                        // some ideas have to be fetched from server
                        var options = {};
                        options['filter[id]'] = ideaIdsToFetch.join(',');
                        if (usersCampaign) {
                            options.campaign = usersCampaign;
                        }

                        var promise = ideas.getList(options)
                            .then(function (ideas) {
                                _.forEach(ideas, function (idea) {
                                    ideaCache[idea.id] = idea;
                                });
                            })
                            .finally(function (ideas) {
                                // remove the ids from the pending
                                _.forEach(ideaIdsToFetch, function (id) {
                                    delete ideaCachePending[id];
                                });
                            });

                        // put the ids to the pending
                        _.forEach(ideaIdsToFetch, function (id) {
                            ideaCachePending[id] = promise;
                        });

                        promisesToWaitFor.push(promise);
                    }

                    if (promisesToWaitFor.length > 0) {
                        return $q.all(promisesToWaitFor).then(_populateFromCache);
                    } else {
                        // all ideas already on client
                        return $q.when(_populateFromCache());
                    }
                };

                var actService = {
                    getIdeas: function (params) {
                        if (!params) {
                            params = {};
                        }

                        params.limit = 1000;
                        return ideas.getList(params);
                    },
                    getIdea: function (ideaId) {
                        if (ideaId && ideaCache[ideaId]) {
                            return $q.when(ideaCache[ideaId]);
                        } else if (ideaId) {
                            return Restangular.one('ideas', ideaId).get().then(function (idea) {
                                ideaCache[idea.id] = idea;
                                return idea;
                            });
                        } else {
                            return $q.when(null);
                        }
                    },
                    saveIdea: function (idea) {
                        if (idea.id) {
                            return Restangular.restangularizeElement(null, idea, "ideas").put().then(function (storedIdea) {
                                ideaCache[storedIdea.id] = storedIdea;
                                return storedIdea;
                            });
                        } else {
                            return Restangular.restangularizeElement(null, idea, 'ideas').post().then(function (storedIdea) {
                                ideaCache[storedIdea.id] = storedIdea;
                                return storedIdea;
                            });
                        }
                    },
                    getActivity: function (activityId) {
                        return Restangular.one('activities', activityId).get({'populate': ['idea', 'owner', 'joiningUsers']})
                            .then(_populateIdeas);
                    },
                    getActivities: function (options) {
                        if (UserService.principal.isAuthenticated()) {
                            return activities.getList(options).then(_populateIdeas);
                        } else {
                            return $q.when([]);
                        }
                    },
                    getActivityEvents: function (options) {
                        if (UserService.principal.isAuthenticated()) {
                            return activityEvents.getList(options).then(_populateIdeas);
                        } else {
                            return $q.when([]);
                        }
                    },
                    getActivityLookaheadCounters: function (activityId, lastAccessSince) {
                        return Restangular.one('activities', activityId).one('lookAheadCounters').get({since: lastAccessSince});
                    },
                    getActivityEventDueState: function (event, type) {
                        // type may be one of ["current, "past", "done", "feedback", "conflict"]
                        // and is used to determine which type of event Card is to be showed

                        // "current": stacks of cards in the "running Acts" section
                        // "past": stacks of cards in the "completed Acts" section
                        // "done": single cards in the fullsized completed Acts section
                        // "feedback": single cards in the activityDetail View
                        // "conflict": single cards int activity Detail View representing conflicts.

                        // Due State is one of: [Conflict, Coach, Past, Present, Future]

                        function _getTimeBasedState(myEvent) {
                            var now = moment();
                            if (now.isAfter(myEvent.start, 'day')) {
                                return 'Past';
                            } else if (now.isSame(myEvent.start, 'day')) {
                                return 'Present';
                            } else {
                                return 'Future';
                            }

                        }

                        if (type === 'conflict') {
                            return 'Conflict';

                        } else if (type === 'current') {
                            if (event.idea && event.idea.action) {
                                return 'Coach';
                            } else {
                                return _getTimeBasedState(event);
                            }


                        } else if (type === 'past' || type === 'done' || type === 'feedback') {
                            if (event.idea && event.idea.action) {
                                return 'Coach';
                            } else {
                                return _getTimeBasedState(event); // reuse 'neutral' eventFuture component type
                            }

                        }

                    },
                    getRecommendations: function (params) {

                        if (UserService.principal.isAuthenticated()) {
                            return Restangular.all('coachRecommendations').getList(params);
                        } else {
                            return [];
                        }

                    },
                    joinPlan: function (plan) {
                        return activities.one(plan.id).all('/join').post();
                    },
                    savePlan: function (plan) {
                        if (plan.id) {
                            return Restangular.restangularizeElement(null, plan, "activities").put();
                        } else {
                            return activities.post(plan);
                        }
                    },
                    deleteActivity: function (activity) {
                        return activities.one(activity.id || activity).remove();
                    },
                    updateActivityEvent: function (actEvent) {
                        // assure that we don't have feedback on a event that was missed
                        // happens when event is first marked 'done', then rated, then edited back to 'missed'
                        if (actEvent.status === 'missed') {
                            actEvent.feedback = undefined;
                        }
                        return actEvent.put();
                    },
                    inviteEmailToJoinPlan: function (email, plan) {
                        return activities.one(plan.id).all('/inviteEmail').post({email: email});
                    },
                    validateActivity: function (activity) {
                        return Restangular.all('activities/validate').post(activity);
                    },
                    getInvitationStatus: function (activityId) {
                        return Restangular.one('activities', activityId).one('invitationStatus').getList();
                    },

                    isOwner: function (activity, user) {
                        if (!user) {
                            user = UserService.principal.getUser();
                        }
                        user = user.id || user;

                        var owner = activity.owner.id || activity.owner;
                        return owner === user;
                    },
                    isJoiningUser: function (activity, user) {

                        if (!user) {
                            user = UserService.principal.getUser();
                        }
                        user = user.id || user;
                        return _.any(activity.joiningUsers, function (joiningUser) {
                            var joining = joiningUser.id || joiningUser;
                            return joining === user;
                        });
                    },

                    getDefaultActivity: function (idea, options) {
                        return ideas.one(idea.id || idea).one('defaultActivity').get(options).then(_populateIdeas);
                    },
                    newIdea: function (campaignId) {

                        var idea = Restangular.restangularizeElement(null, {
                            number: campaignId ? 'CUSTOM_CAMPAIGN_ACTIVITY' : 'NEW',
                            source: campaignId ? 'campaign' : 'youpers',
                            defaultfrequency: "once",
                            "defaultexecutiontype": "group",
                            "defaultduration": 60,
                            "defaultStartTime": moment().startOf('hour'),
                            fields: [],
                            recWeights: [],
                            topics: [],
                            author: UserService.principal.getUser().id
                        }, 'ideas');

                        if (campaignId) {
                            idea.campaign = campaignId;
                        }
                        return idea;
                    },

                    updateActivityLookahead: function (activity) {

                        if(activity.id) {
                            var localStorageKey = 'user=' + UserService.principal.getUser().id;
                            var localStorage = localStorageService.get(localStorageKey) || {};
                            localStorage[activity.id] = moment();
                            localStorageService.set(localStorageKey, localStorage);
                        }
                    },

                    populateIdeas: _populateIdeas
                };

                return actService;
            }
        ])
    ;


}());
