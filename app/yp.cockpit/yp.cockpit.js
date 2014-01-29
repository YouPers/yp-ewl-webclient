(function () {
    'use strict';


    angular.module('yp.cockpit',
            [
                'restangular',

                'yp.assessment',

                'd3', 'd3.dir-hbar', 'd3.dir-vbar', 'd3.gauge', 'd3.dir-line-chart'
            ])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', 'RestangularProvider', 'yp.config',
            function ($stateProvider, $urlRouterProvider, accessLevels, RestangularProvider, config) {
                //

                // Now set up the states
                $stateProvider

                    .state('cockpit', {
                        url: "/cockpit",
                        templateUrl: "yp.cockpit/yp.cockpit.html",
                        access: accessLevels.individual
                    });
            }]);

}());