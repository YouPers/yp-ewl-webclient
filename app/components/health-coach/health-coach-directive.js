(function () {

    'use strict';

    angular.module('yp.dhc')
        .directive('HealthCoach', ['$rootScope', 'HealthCoachService', '$state',
            function ($rootScope, HealthCoachService, $state) {
            return {
                restrict: 'E',
                scope: {},
                templateUrl: 'components/health-coach/health-coach-directive.html',

                link: function (scope, elem, attrs) {
                    HealthCoachService.getCoachMessages($state.current.name).then(function(result) {
                        scope.coachMessages = result;
                    });
                }
            };
        }]);

}());