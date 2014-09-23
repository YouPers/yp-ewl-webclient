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

                    var clearDateOnlyWatch;

                    scope.$watch('date', function () {

                        if(clearDateOnlyWatch) {
                            clearDateOnlyWatch();
                        }

                        scope.dateOnly = moment(scope.date).format();

                        clearDateOnlyWatch = scope.$watch('dateOnly', function(val, old) {

                            if(val) {
                                var dateOnly = moment(val);
                                var date = moment(scope.date);
                                date.year(dateOnly.year());
                                date.dayOfYear(dateOnly.dayOfYear());

                                scope.date = date.toISOString();
                            }
                        });
                    });

                    // working copy for the datepicker to preserve the time in the attribute 'date'
                    scope.dateOnly = scope.date;


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


    /**
     * dateParser using moment.js that works with the german date format DD.MM.YYYY
     * as opposed to the dateParser that comes with the ui bootstrap datepicker
     */
        .directive('dateParser', function () {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, element, attrs, ctrl) {

                    // remove vendor dateParser from datepicker
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

                        // fix for the date format mismatch between moment.js and the standard the datepicker uses
                        // dd vs DD / yyyy vs YYYY
                        var format = attrs.dateParser.toUpperCase();

                        var date = moment(data, format);

                        var valid = data && date.isValid();

                        ctrl.$setValidity('date', valid);

                        return valid ? date : undefined;
                    });
                }
            };

        })
        .directive('dateFormatter', function () {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, element, attrs, ctrl) {

                    // remove vendor dateParser from datepicker
                    _.remove(ctrl.$formatters, function(parser) {
                        return parser.name === 'formatDate';
                    });

                    ctrl.$formatters.push(function (date) {

                        if(!attrs.dateFormatter) {
                            throw new Error('date format is required');
                        }

                        var format = attrs.dateFormatter.toUpperCase();

                        var formattedDate = moment(date).format(format);

                        return formattedDate;
                    });
                }
            };

        })
    ;

}());