'use strict'

angular.module('yp.filters',[]).
    filter('fromNow', function() {
        return function(dateString) {
            return moment(new Date(dateString)).fromNow()
        };
    });
