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
        .directive('healthCoach', ['$rootScope', 'HealthCoachService', '$window', '$timeout', '$state',
            '$translate', '$sce', 'localStorageService',
            function ($rootScope, HealthCoachService, $window, $timeout, $state,
                      $translate, $sce, localStorageService) {
                return {
                    restrict: 'E',
                    scope: {
                        event: '=',
                        data: '=',
                        coachMessage: '@'
                    },
                    templateUrl: 'components/health-coach/health-coach-directive.html',

                    link: function (scope, elem, attrs) {

                        var queuedEvent = HealthCoachService.getQueuedEvent();
                        if (queuedEvent) {
                            scope.event = queuedEvent;
                        }

                        scope.$watch('event', function (val, old) {
                            var eventKey = 'healthCoach.' + ( scope.event ? $state.current.name + '.' + scope.event : undefined );
                            if (localStorageService.get(eventKey)) {
                                scope.messageHidden = true;
                            } else {
                                scope.messageHidden = false;
                                $timeout(function() {
                                    scope.messageHidden = true;
                                }, 10000);
                            }
                            localStorageService.set(eventKey, true);
                            $translate(eventKey, scope.data).then(function (eventMessage) {
                                _displayMessage(eventMessage);
                            });
                        });
                        scope.$watch('coachMessage', function (newVal, oldVal) {
                            if (newVal) {
                                _displayMessage(newVal);
                            }
                        });

                        $rootScope.$on('healthCoach:event', function (event, healthCoachEvent) {
                            scope.event = healthCoachEvent;
                        });

                        $rootScope.$on('healthCoach:displayMessage', function (event, message) {
                            scope.messageHidden = false;
                            _displayMessage(message);
                            scope.$parent.$broadcast('initialize-scroll-along');
                        });

                        function _getFormattedMessage(message) {
                            return $sce.trustAsHtml(marked(message));
                        }

                        function _displayMessage (msg) {
                            scope.formattedMessage = _getFormattedMessage(msg);
                            scope.newMessage = false;
                            $timeout(function () {
                                scope.newMessage = true;
                            });
                        }


                    }
                };
            }]);

}());