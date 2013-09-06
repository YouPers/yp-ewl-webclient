'use strict'

angular.module('yp.filters',[]).
    filter('fromNowFake', function() {
        return function(dateString) {
            return moment(new Date(dateString)).from(new Date(2013, 7, 20, 13, 30))
        };
    });
