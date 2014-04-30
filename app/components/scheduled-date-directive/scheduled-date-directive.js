(function () {

    'use strict';

    angular.module('yp.dhc')
        .directive('scheduledDate', ['$rootScope', '$sce', function ($rootScope, $sce) {
            return {
                restrict: 'EA',
                scope: {
                    start: '=',
                    end: '=',
                    frequency: '=',
                    recurrence: '='
                },
                templateUrl: 'components/scheduled-date-directive/scheduled-date-directive.html',

                link: function (scope, elem, attrs) {

                    scope.endDate = function() {

                        if(scope.frequency === 'once') {
                            return scope.start;
                        } else if(scope.frequency === 'day') {
                            return moment(scope.start).add('days', scope.recurrence);
                        } else if(scope.frequency === 'week') {
                            return moment(scope.start).add('weeks', scope.recurrence);
                        }

                    };
                    scope.weekday = function() {
                        return moment(scope.startDate).format("dddd") + 's';
                    };

                }
            };
        }]);

}());