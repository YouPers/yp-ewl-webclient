(function () {

    'use strict';

    angular.module('yp.dhc')
        .directive('healthCoach', ['$rootScope', 'HealthCoachService', '$state',
            function ($rootScope, HealthCoachService, $state) {
            return {
                restrict: 'E',
                scope: {},
                templateUrl: 'components/health-coach/health-coach-directive.html',

                link: function (scope, elem, attrs) {
                    console.log($state.current.name);
                    HealthCoachService.getCoachMessages($state.current.name).then(function(result) {
                        scope.coachMessages = result;
                    });
                }
            };
        }])
        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('components/health-coach/health-coach');
        }]);

}());