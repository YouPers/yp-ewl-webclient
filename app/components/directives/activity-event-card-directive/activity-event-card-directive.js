(function () {

    'use strict';

    angular.module('yp.components.activityEventCard', [])

        .directive('activityEventCard', ['$rootScope', '$sce', '$timeout', 'ActivityService',
            function ($rootScope, $sce, $timeout, ActivityService) {
                return {
                    restrict: 'EA',
                    scope: {
                        type: '@',
                        event: '=',
                        isLastEvent: '@'
                    },
                    templateUrl: 'components/directives/activity-event-card-directive/activity-event-card-directive.html',

                    link: function (scope, elem, attrs) {

                        scope.event.dueState = ActivityService.getActivityEventDueState(scope.event, scope.type);

                        scope.isFutureEvent = function (event) {
                            return moment().isBefore((event || scope.event).end, 'day');
                        };

                        var updateEvent = function updateEvent(event, old) {

                            // only update events with an id, not the dummy events generated by the validation request
                            if (event && event.id && !_.isEqual(event, old)) {


                                var healthCoachEvent = (Boolean(scope.isLastEvent) === true ? 'lastEvent' : 'event') +
                                    (event.status === 'done' ? 'Done' : 'Missed');
                                scope.$root.$broadcast('healthCoach:event', healthCoachEvent);

                                ActivityService.updateActivityEvent(scope.event);
                            }
                        };

                        $timeout(function () {
                            scope.$watch('event', _.debounce(updateEvent, 1000), true);
                        });

                        scope.commentInput = function ($event) {
                            if($event.keyCode === 13 && !$event.shiftKey) {
                                updateEvent(scope.event);
                                scope.event.saved = true;
                            }
                        };
                        scope.editComment = function () {
                            scope.event.saved = false;
                            $timeout(function () {
                                elem.find('textarea')[0].focus();
                            });
                        };

                        scope.getRenderedText = function (text) {
                            if (text) {
                                return $sce.trustAsHtml(marked(text));
                            } else {
                                return "";
                            }
                        };
                        scope.stopPropagation = function (event) {
                            event.stopPropagation();
                        };

                    }
                };
            }]);

}());