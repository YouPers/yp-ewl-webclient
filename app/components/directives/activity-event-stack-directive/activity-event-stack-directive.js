(function () {

    'use strict';


    /**
     * activityEventStack
     *
     *  required scope attributes:
     *      - events: an event can be populated with an idea, and optionally, the activity ( needed for the location )
     *                  to show events with arbitrary ideas/activities
     *      - idea: default idea if no individual idea is attached to an event            
     *      - activity: default activity if no individual activity is attached to an event            
     *
     */
    angular.module('yp.components.activityEventStack', [])

        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('components/directives/activity-event-stack-directive/activity-event-stack-directive');
        }])

        .directive('activityEventStack', ['$rootScope', '$sce', '$window', '$state', function ($rootScope, $sce, $window, $state) {
            return {
                restrict: 'EA',
                scope: {
                    events: '=?',
                    idea: '=',
                    activity: '=',
                    socialInteraction: '='
                },
                templateUrl: 'components/directives/activity-event-stack-directive/activity-event-stack-directive.html',

                link: function (scope, elem, attrs) {

                    if(!scope.events) {

                        var event;

                        if(scope.activity) {
                            event = scope.activity.mainEvent;
                            event.activity = scope.activity;
                            event.idea = scope.activity.idea;
                        } else if(scope.idea) {
                            event = {
                                idea: scope.idea
                            };
                        } else {
                            throw new Error('one the attributes events, activity or idea is required');
                        }
                        scope.events = [event];

                    } else {
                        scope.events = _.sortBy(scope.events, function(event) {
                            return - new Date(event.start).getTime();
                        });
                        scope.events = scope.events.splice(0, Math.min(10, scope.events.length));
                        _.forEach(scope.events, function (event) {
                            if(typeof event.idea !== 'object') {
                                event.idea = scope.idea;
                            }
                            if(typeof event.activity !== 'object') {
                                event.activity = scope.activity;
                            }
                        });
                    }

                    var partiallyVisibleCardOffset = 3; // a card with a different due state
                                                        // than the one before will be partially visible
                    var offset = 0;
                    var dueState;

                    scope.dueState = function (event) {
                        if(!event.start) {
                            return false;
                        }
                        var now = moment();
                        if(now.isAfter(event.start, 'day')) {
                            return 'overdue';
                        } else if(now.isSame(event.start, 'day')) {
                            return 'today';
                        } else {
                            return 'upcoming';
                        }
                    };

                    _.forEach(scope.events, function (event, index) {

                        var due = scope.dueState(event);
                        if(dueState && due !== dueState) {
                            offset += partiallyVisibleCardOffset;
                        }
                        dueState = due;
                        event.offset = offset;
                        offset += 1;
                    });

                    scope.heightClass = {};
                    if(scope.socialInteraction) {
                            scope.heightClass = 'height-recommendation';
                    } else {
                        scope.heightClass = 'height-' + (!scope.events.length ? 0 : scope.events[scope.events.length-1].offset);
                    }

                    scope.showActivity = function(activity) {
                        $window.location = $state.href('activity.content', { id: activity.id }) + '?idea=' + activity.idea.id;
                    };


                }
            };
        }]);

}());