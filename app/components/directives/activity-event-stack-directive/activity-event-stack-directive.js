(function () {

    'use strict';

    angular.module('yp.components.activityEventStack', [])
        .directive('activityEventStack', ['$rootScope', '$sce', '$window', '$state', function ($rootScope, $sce, $window, $state) {
            return {
                restrict: 'EA',
                scope: {
                    activity: '=',
                    events: '='
                },
                templateUrl: 'components/directives/activity-event-stack-directive/activity-event-stack-directive.html',

                link: function (scope, elem, attrs) {

//                    scope.sortedEvents = _.sortBy(scope.events, function(event) {
//                        return new Date(event.start).getTime();
//                    });

                    if(!attrs.activity) {
                        throw new Error("activityEventCard: attribute 'activity' is required");
                    }

                    if(!scope.events) {
                        scope.events = [{}];
                    } else {
                        scope.events = _.sortBy(scope.events, function(event) {
                            return - new Date(event.start).getTime();
                        });
                    }

                    var partiallyVisibleCardOffset = 3; // a card with a different due state
                                                        // than the one before will be partially visible
                    var offset = 0;
                    var dueState;


                    scope.dueState = function (event) {
                        var now = moment();
                        if(now.isAfter(event.start, 'day')) {
                            return 'overdue';
                        } else if(now.isSame(event.start, 'day')) {
                            return 'today';
                        } else {
                            return 'upcoming';
                        }
                    };

                    if(attrs.events) {
                        _.forEach(scope.events, function (event, index) {

                            var due = scope.dueState(event);
                            if(dueState && due !== dueState) {
                                offset += partiallyVisibleCardOffset;
                            }
                            dueState = due;
                            event.offset = offset;
                            offset += 1;
                        });
                    }

                    scope.showActivity = function(activity) {
                        $window.location = $state.href('activity.content', { id: activity.id }) + '?idea=' + activity.idea.id;
                    };


                }
            };
        }]);

}());