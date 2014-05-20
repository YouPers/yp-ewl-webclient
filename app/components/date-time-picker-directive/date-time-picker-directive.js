(function () {

    'use strict';

    angular.module('yp.dhc')
        .directive('dateTimePicker', [function () {
            return {
                restrict: 'EA',
                scope: {
                    start: '=',
                    end: '='
                    
                },
                templateUrl: 'components/date-time-picker-directive/date-time-picker-directive.html',

                link: function (scope, elem, attrs) {

                    if(!attrs.start || !attrs.end) {
                        throw new Error('start and end date attributes are required');
                    }

                    // copy of start date the date picker can mess around with and loose it's time
                    scope.startDate = scope.start;


                    scope.$watch('startDate', function(val, old) {

                        if(val) {
                            var startDate = moment(val);
                            var start = moment(scope.start);
                            start.year(startDate.year());
                            start.dayOfYear(startDate.dayOfYear());

                            scope.start = start.toISOString();
                        }
                    });

                    scope.$watch('start', function(val, old) {
                        if(old !== val) {
                            var end = moment(scope.end).add(moment(val).diff(old)).toISOString();
                            scope.end = old ? end : val;
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

                    if (!ctrl)
                        return;

                    _.remove(ctrl.$parsers, function(parser) {
                        return parser.name == 'parseDate';
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