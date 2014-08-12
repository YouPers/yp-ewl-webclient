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
                    }

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

                    scope.positionIndex = function (index) {

                        var pos = 0;
                        var dueState;

                        if(attrs.events) {
                            _.forEach(scope.events.slice(0, index), function (event) {

                                var due = scope.dueState(event);
                                if(dueState && due !== dueState) {
                                    pos += 3;
                                }
                                dueState = due;
                                pos += 1;

                            });
                        }

                        return pos;

                    };

                    scope.showActivity = function(activity) {
                        $window.location = $state.href('activity.content', { id: activity.id }) + '?idea=' + activity.idea.id;
                    };


                }
            };
        }]);

}());