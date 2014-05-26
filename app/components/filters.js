(function () {
    'use strict';


    angular.module('yp.components')



        .filter('fromNow', function () {
            return function (dateString) {
                var myMoment = moment(dateString);

                if (myMoment.isBefore(moment().subtract('day', 3)) || myMoment.isAfter(moment().add('day', 3))) {
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