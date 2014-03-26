(function () {

    'use strict';

    angular.module('yp.dhc')
        .directive('activitySchedule', ['$rootScope', function ($rootScope) {
            return {
                restrict: 'EA',
                scope: {

                },
//                templateUrl: 'components/activity-schedule-directive/activity-schedule-directive.html',

                link: function (scope, elem, attrs) {

                    console.log(scope);

                }
            };
        }]);

}());
