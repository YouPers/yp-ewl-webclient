(function () {

    'use strict';

    angular.module('yp.components.datePicker', [])
        .directive('datePicker', [function () {
            return {
                restrict: 'EA',
                scope: {
                    date: '=',
                    minDate: '=?',
                    maxDate: '=?',
                    required: '=',
                    disabled: '=?'
                },
                templateUrl: 'components/directives/date-picker-directive/date-picker-directive.html',

                link: function (scope, elem, attrs) {

                    if(!attrs.date) {
                        throw new Error('date attribute is required');
                    }

                    scope.date = moment(scope.date).toDate();

                    scope.dateFormat = 'dd.MM.yyyy';

                    scope.toggle = function ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                        scope.opened = !scope.opened;
                    };
                }
            };
        }]);

}());