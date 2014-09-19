(function () {
    'use strict';

    angular.module('yp.components.activity')

        .factory('ActivityService', ['$http', 'Restangular', '$q', 'UserService', '$rootScope',
            function ($http, Restangular, $q, UserService, $rootScope) {
                var ideas = Restangular.all('ideas');
                var activities = Restangular.all('activities');
                var activityEvents = Restangular.all('activityevents');

                var ideaCache = {};

                var _populateIdeas = function (object) {
                    // make it work for arrays and single objects
                    var objects = Array.isArray(object) ? object : [object];

                    // determine whether we need to fetch anything from server
                    var ideaIdsToFetch = [];
                    _.forEach(objects, function (obj) {
                        if (obj.idea && !_.isObject(obj.idea) && !ideaCache[obj.idea]) {
                            ideaIdsToFetch.push(obj.idea);
                        }
                    });

                    /**
                     * populate objects synchronously from Cache, assumes that all needed objects are in the cache
                     * @returns {*}
                     * @private
                     */
                    function _populateFromCache () {
                        _.forEach(objects, function(obj) {
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

                    if (ideaIdsToFetch.length > 0) {
                        // some ideas have to be fetched from server
                        var options = {};
                        options['filter[id]'] = ideaIdsToFetch.join(',');
                        return ideas.getList(options).then(function (ideas) {
                            _.forEach(ideas, function (idea) {
                                ideaCache[idea.id] = idea;
                            });
                        }).then(_populateFromCache);
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
                        if (ideaId) {
                            return Restangular.one('ideas', ideaId).get();
                        } else {
                           return $q.when(null);
                        }
                    },
                    saveIdea: function (idea) {
                        if (idea.id) {
                            return idea.put();
                        } else {
                            return Restangular.restangularizeElement(null, idea, 'ideas').post();
                        }
                    },
                    getActivity: function (activityId) {
                        return Restangular.one('activities', activityId).get({'populate': ['idea', 'owner', 'invitedBy', 'joiningUsers']})
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
                    getActivityEventDueState: function(event, type) {

                        // Due State is one of: [Conflict, Future, Coach, Past, Present, Future]

                        if(type) {

                            if(type === 'conflict') {
                                return 'Conflict';
                            } else if(type !== 'current') {
                                if(event.idea && event.idea.action) {
                                    return 'Coach';
                                } else {
                                    return 'Future'; // reuse 'neutral' eventFuture component type
                                }
                            }

                        }

                        if(event.idea && event.idea.action) {
                            return 'Coach';
                        }

                        if(!event.start) {
                            return false;
                        }
                        var now = moment();
                        if(now.isAfter(event.start, 'day')) {
                            return 'Past';
                        } else if(now.isSame(event.start, 'day')) {
                            return 'Present';
                        } else {
                            return 'Future';
                        }
                    },
                    getRecommendations: function (topicId) {
                        var params = {
                            limit: 1000,
                            topic: topicId
                        };

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
                        return actEvent.put();
                    },
                    inviteEmailToJoinPlan: function (email, plan) {
                        return activities.one(plan.id).all('/inviteEmail').post({email: email});
                    },
                    validateActivity: function (activity) {
                        return Restangular.all('activities/validate').post(activity);
                    },
                    getInvitationStatus: function(activityId) {
                        return Restangular.one('activities', activityId).one('invitationStatus').getList();
                    },


                    getDefaultActivity: function (idea, options) {
                        return ideas.one(idea.id || idea).one('defaultActivity').get(options).then(_populateIdeas);
                    },

                    getDefaultPlan: function (idea, campaignId) {
                        var now = moment();
                        var newMainEvent = {
                            "allDay": false
                        };
                        var duration = idea.defaultduration ? idea.defaultduration : 60;
                        if (idea.defaultfrequency === 'week') {
                            newMainEvent.start = moment(now).startOf('hour').toDate();
                            newMainEvent.end = moment(newMainEvent.start).add('m', duration).toDate();
                            newMainEvent.frequency = 'week';
                            newMainEvent.recurrence = {
                                "endby": {
                                    "type": "after",
                                    "after": 6
                                },
                                every: 1
                            };
                        } else if (idea.defaultfrequency === 'day') {
                            newMainEvent.start = moment(now).add('d', 1).startOf('hour').toDate();
                            newMainEvent.end = moment(newMainEvent.start).add('m', duration).toDate();
                            newMainEvent.frequency = 'day';
                            newMainEvent.recurrence = {
                                "endby": {
                                    "type": "after",
                                    "after": 6
                                },
                                every: 1
                            };
                        } else { // default is "once"
                            newMainEvent.start = moment(now).add('d', 1).startOf('hour').toDate();
                            newMainEvent.end = moment(newMainEvent.start).add('m', duration).toDate();
                            newMainEvent.frequency = 'once';
                            newMainEvent.recurrence = {
                                "endby": {
                                    "type": "after",
                                    "after": 6
                                },
                                every: 1
                            };
                        }

                        var plan = {
                            idea: idea,
                            status: 'active',
                            mainEvent: newMainEvent,
                            source: campaignId ? 'campaign' : 'community',
                            executionType: idea.defaultexecutiontype,
                            visibility: campaignId ? 'campaign' : idea.defaultvisibility,
                            fields: idea.fields,
                            topics: idea.topics,
                            title: idea.title,
                            number: idea.number
                        };

                        if (campaignId) {
                            plan.campaign = campaignId;
                        }
                        return plan;
                    }
                };

                return actService;
            }
        ])
    ;


}
()
    )
;
