(function () {
    'use strict';


    angular.module('yp.components.util.filters', [])



        .filter('fromNow', function () {
            return function (dateString) {
                var myMoment = moment(dateString);

                if (myMoment.isBefore(moment().subtract(3, 'day')) || myMoment.isAfter(moment().add(3, 'day'))) {
                    return myMoment.format('L');
                } else {
                    return myMoment.fromNow();
                }
            };
        })
        .filter('calendar', function () {
            return function (dateString) {
                var myMoment = moment(dateString);
                return myMoment.calendar();
            };
        })
        .filter('shortCalendar', ['$translate', function ($translate) {
            return function (dateString) {
                var m = moment(dateString);
                var day;
                if(moment().isSame(m, 'day')) {
                    day = $translate.instant('calendar.today');
                } else if(moment().add(1, 'days').isSame(m, 'day')) {
                    day = $translate.instant('calendar.tomorrow');
                } else if(moment().subtract(1, 'days').isSame(m, 'day')) {
                    day = $translate.instant('calendar.yesterday');
                } else {
                    day = m.format('D. MMM');
                }
                return day + ', ' + m.format('HH:mm');
            };
        }])
        .filter('shortCalendarNoTime', ['$translate', function ($translate) {
            return function (dateString) {
                var m = moment(dateString);
                var day;
                if(moment().isSame(m, 'day')) {
                    day = $translate.instant('calendar.today');
                } else if(moment().add(1, 'days').isSame(m, 'day')) {
                    day = $translate.instant('calendar.tomorrow');
                } else if(moment().subtract(1, 'days').isSame(m, 'day')) {
                    day = $translate.instant('calendar.yesterday');
                } else {
                    day = m.format('D. MMM');
                }
                return day;
            };
        }])
        .filter('eventDate', function () {
            return function (dateString) {
                var myMoment = moment(dateString);
                return myMoment.format('dddd, DD. MMMM');
            };
        })

        .filter('time', function () {
            return function (dateString) {
                var myMoment = moment(dateString);
                return myMoment.format('HH:mm');
            };
        })

        .filter('fulldate', function () {
            return function (dateString) {
                var myMoment = moment(dateString);
                return myMoment.format('DD.MM.YYYY HH:mm');
            };
        })
        .filter('stripTags', function () {
            return function (val) {
                return val.replace(/(<([^>]+)>)/ig, " ");
            };
        })


    ;


}());