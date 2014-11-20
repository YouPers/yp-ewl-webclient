(function () {
    'use strict';


    angular.module('yp.dhc')

        .factory("DailySummaryService", ['ErrorService', 'Restangular',
            function (ErrorService, Rest) {

                var dailySummary = Rest.one('dailySummary');

                var DailySummaryService = {
                    getDailySummary: function (options) {
                        return dailySummary.get(options);
                    }
                };
                return DailySummaryService;
            }]);
}());
