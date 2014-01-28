(function () {
    'use strict';


    angular.module('yp.cockpit',
        [
            'restangular',

            'yp.assessment',

            'd3', 'd3.dir-hbar', 'd3.dir-vbar', 'd3.gauge', 'd3.dir-line-chart'
        ]);


}());