(function () {

    'use strict';


    /**
     * activityEventStack
     *
     *  required scope attributes:
     *
     *      - type: one of
     *
     *          - current: currently active events of a single activity (default)
     *          - past: list of done or missed events that have already past
     *
     *          - dismissed: list of invitations and recommendation the user has dismissed
     *
     *      - events: an event can be populated with an idea, and optionally, the activity ( needed for the location )
     *                  to show events with arbitrary ideas/activities
     *      - idea: default idea if no individual idea is attached to an event            
     *      - activity: default activity if no individual activity is attached to an event            
     *
     */
    angular.module('yp.components.activityEventStack', [])
        .directive('activityEventStack', ['$rootScope', '$sce', '$window', '$state', 'ActivityService', function ($rootScope, $sce, $window, $state, ActivityService) {
            return {
                restrict: 'EA',
                scope: {
                    type: '@',

                    events: '=?',
                    idea: '=',
                    activity: '='
                },
                templateUrl: 'components/directives/activity-event-stack-directive/activity-event-stack-directive.html',

                link: function (scope, elem, attrs) {

                    var type = scope.type || 'current';

                    if(type === 'current' || type === 'past' || type === 'dismissed') {
                        if(!scope.events) {
                            throw new Error('"events" is required for type "current"');
                        }

                        scope.events = _.sortBy(scope.events, function(event) {
                            return - new Date(event.start).getTime();
                        });

                        scope.events = scope.events.splice(scope.events.length - Math.min(9, scope.events.length), scope.events.length); // limit number of events to 10

                        _.forEach(scope.events, function (event) {
                            if(typeof event.idea !== 'object') {
                                event.idea = scope.idea;
                            }
                            if(typeof event.activity !== 'object') {
                                event.activity = scope.activity;
                            }
                        });
                    } else {
                        throw new Error('unknown type ' + type);
                    }

                    var partiallyVisibleCardOffset = 3; // a card with a different due state
                                                        // than the one before will be partially visible


                    function dueState(event) {
                        return ActivityService.getActivityEventDueState(event, scope.type);
                    }

                    var offset = 0;
                    var lastDueState;
                    _.forEach(scope.events, function (event, index) {

                        var due = dueState(event);

                        if(type === 'current' && lastDueState && due !== lastDueState) {
                            offset += partiallyVisibleCardOffset;
                        }

                        event.dueState = lastDueState = due;
                        event.offset = offset;
                        offset += 1;
                    });

                    if(type === 'recommendation') {
                            scope.heightClass = 'height-recommendation';
                    } else {
                        scope.heightClass = 'height-' + (!scope.events.length ? 0 : scope.events[scope.events.length-1].offset);
                    }

                }
            };
        }]);

}());