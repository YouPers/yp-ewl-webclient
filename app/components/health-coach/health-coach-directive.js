(function () {

    'use strict';

    /**
     * directive health-coach
     *
     * there 4 ways to display a health coach message:
     *
     *  - scope attribute 'event' - the event name will be localized according to the state: [dhc,dcm].stateName.eventName
     *  - $rootScope.$emit('healthCoach:event', eventName) - will be localized as above
     *  - $rootScope.$emit('healthCoach:displayMessage') - display an already localized message
     *  - queue an event for the next state using HealthCoachService.queueEvent,
     *    it will be consumed and cleared on the next invocation of the health-coach directive
     *
     *
     *
     */

    angular.module('yp.components.healthCoach')
        .directive('healthCoach', ['$rootScope', 'HealthCoachService', '$window', '$timeout', '$state', '$translate','$sce',
            function ($rootScope, HealthCoachService, $window, $timeout, $state, $translate, $sce) {
            return {
                restrict: 'E',
                scope: {
                    event: '=',
                    data: '=',
                    coachMessage: '@'
                },
                templateUrl: 'components/health-coach/health-coach-directive.html',

                link: function (scope, elem, attrs) {

                    scope.getFormattedMessage = function(message) {
                        return $sce.trustAsHtml(marked(message));
                    };

                    var queuedEvent = HealthCoachService.getQueuedEvent();
                    if(queuedEvent) {
                        scope.event = queuedEvent;
                    }

                    scope.$watch('event', function () {
                        var eventKey = 'healthCoach.' + ( scope.event ? $state.current.name + '.' + scope.event : undefined );
                        $translate(eventKey, scope.data).then(function (eventMessage) {
                            scope.eventMessage = scope.getFormattedMessage(eventMessage);
                        });
                    });

                    $rootScope.$on('healthCoach:event', function (event, healthCoachEvent) {
                        scope.event = healthCoachEvent;
                    });
                    $rootScope.$on('healthCoach:displayMessage', function (event, message) {
                        scope.coachMessage = scope.getFormattedMessage(message);
                        scope.$parent.$broadcast('initialize-scroll-along');
                    });

                    var coach = elem[0];

                    scope.$watch(function () {
                        return window.innerHeight + coach.clientHeight; // listen to both the window height and the coach height

                    }, function () {
                        if(!scope.expandable) { // one way only, no 'show-less'
                            var availableHeight = window.innerHeight - 50; // minus an offset from the top
                            scope.expandable = availableHeight < coach.clientHeight;
                            if(scope.expandable) {
                                scope.style = { 'max-height': availableHeight /2 + 'px' };
                            }
                        }

                    });


                }
            };
        }]);

}());