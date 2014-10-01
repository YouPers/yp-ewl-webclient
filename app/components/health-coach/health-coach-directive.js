(function () {

    'use strict';

    angular.module('yp.components.healthCoach')
        .directive('healthCoach', ['$rootScope', 'HealthCoachService', '$window', '$timeout', '$state', '$translate','$sce',
            function ($rootScope, HealthCoachService, $window, $timeout, $state, $translate, $sce) {
            return {
                restrict: 'E',
                scope: {
                    event: '='
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
                        var eventKey = scope.event ? $state.current.name + '.' + scope.event : undefined;
                        $translate(eventKey).then(function (eventMessage) {
                            scope.eventMessage = scope.getFormattedMessage(eventMessage);
                        });
                    });

                    $rootScope.$on('healthCoach:event', function (event, healthCoachEvent) {
                        scope.event = healthCoachEvent;
                    });
                    $rootScope.$on('healthCoach:displayMessage', function (event, message, interpolateParams) {
                        scope.coachMessage = scope.getFormattedMessage(message);
                        scope.$parent.$broadcast('initialize-scroll-along');
                    });

                }
            };
        }]);

}());