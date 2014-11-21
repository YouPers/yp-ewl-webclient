(function () {
    'use strict';


    angular.module('yp.dhc')

        .factory("DailySummaryService", ['ErrorService', 'Restangular',
            function (ErrorService, Rest) {

                var dailySummary = Rest.one('dailySummary');
                var sendDailySummary = Rest.one('sendDailySummary');

                var DailySummaryService = {
                    getDailySummary: function (options) {
                        return dailySummary.get(options);
                    },
                    sendDailySummary: function (options) {
                        return sendDailySummary.post(options);
                    }
                };
                return DailySummaryService;
            }]);
}());
