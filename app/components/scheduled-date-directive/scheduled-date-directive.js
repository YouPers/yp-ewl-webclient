(function () {

    'use strict';

    angular.module('yp.components')
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

                    scope.weekday = function() {
                        return moment(scope.startDate).format("dddd") + 's';
                    };

                }
            };
        }]);

}());