(function () {

    'use strict';

    angular.module('yp.dhc')
        .directive('datePicker', [function () {
            return {
                restrict: 'EA',
                scope: {
                    date: '='
                },
                templateUrl: 'components/date-picker-directive/date-picker-directive.html',

                link: function (scope, elem, attrs) {

                    if(!attrs.date) {
                        throw new Error('date attribute is required');
                    }

                    // copy of start date the date picker can mess around with and loose it's time
                    scope.dateOnly = scope.date;

                    scope.$watch('dateOnly', function(val, old) {

                        if(val) {
                            var dateOnly = moment(val);
                            var start = moment(scope.start);
                            start.year(dateOnly.year());
                            start.dayOfYear(dateOnly.dayOfYear());

                            scope.date = start.toISOString();
                        }
                    });

                    scope.showWeeks = false;
                    scope.minDate = moment().toISOString();

                    scope.dateFormat = 'dd.MM.yyyy';

                    scope.dateOptions = {
                        'year-format': "'yy'",
                        'starting-day': 1
                    };

                }
            };
        }])


        .directive('dateParser', function () {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, element, attrs, ctrl) {

                    _.remove(ctrl.$parsers, function(parser) {
                        return parser.name === 'parseDate';
                    });

                    ctrl.$parsers.push(function (data) {

                        if(data instanceof Date) {
                            return data;
                        }

                        if(!attrs.dateParser) {
                            throw new Error('date format is required');
                        }

                        var format = attrs.dateParser.toUpperCase();

                        var date = moment(data, format);

                        var isRecent = date.year() > moment().year() - 2;
                        var valid = data && date.isValid() && isRecent;

                        ctrl.$setValidity('date', valid);

                        return valid ? date : undefined;
                    });
                }
            };

        })
    ;

}());