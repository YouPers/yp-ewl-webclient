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


    ;


}());