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
                    required: '='
                },
                templateUrl: 'components/directives/date-picker-directive/date-picker-directive.html',

                link: function (scope, elem, attrs) {

                    if(!attrs.date) {
                        throw new Error('date attribute is required');
                    }

                    function dateWatch() {
                        // working copy for the datepicker to preserve the time in the attribute 'date'
                        scope.dateOnly = moment(scope.date).format();
                    }

                    dateWatch();
                    var clearDateWatch;


                    scope.$watch('dateOnly', function(val, old) {

                        if(val) {
                            var dateOnly = moment(val);
                            var date = moment(scope.date);
                            date.year(dateOnly.year());
                            date.dayOfYear(dateOnly.dayOfYear());

                            if(clearDateWatch) {
                                clearDateWatch();
                            }
                            scope.date = date.format();
                            clearDateWatch = scope.$watch('date', dateWatch);
                        }
                    });


                    scope.showWeeks = false;

                    scope.dateFormat = 'dd.MM.yyyy';

                    scope.dateOptions = {
                        'year-format': "'yy'",
                        'starting-day': 1
                    };

                    scope.toggle = function ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                        scope.opened = !scope.opened;
                    };
                }
            };
        }]);

}());