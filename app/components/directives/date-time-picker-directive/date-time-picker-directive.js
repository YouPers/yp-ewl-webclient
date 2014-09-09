(function () {

    'use strict';

    angular.module('yp.components.dateTimePicker', [])
        .directive('dateTimePicker', [function () {
            return {
                restrict: 'EA',
                scope: {
                    start: '=',
                    end: '='
                    
                },
                templateUrl: 'components/directives/date-time-picker-directive/date-time-picker-directive.html',

                link: function (scope, elem, attrs) {

                    if(!attrs.start || !attrs.end) {
                        throw new Error('start and end date attributes are required');
                    }

                }
            };
        }]);

}());