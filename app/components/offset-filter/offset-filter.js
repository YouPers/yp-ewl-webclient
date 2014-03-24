(function () {

    'use strict';

    angular.module('yp.dhc')

        .filter('offset', function() {
            return function(input, start) {
                if(input) {
                    start = parseInt(start, 10);
                    return input.slice(start);
                }
            };
        });

}());