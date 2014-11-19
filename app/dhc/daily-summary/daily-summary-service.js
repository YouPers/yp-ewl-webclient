(function () {
    'use strict';


    angular.module('yp.dhc')

        .factory("DailySummaryService", ['ErrorService', 'Restangular',
            function (ErrorService, Rest) {

                var dailySummary = Rest.one('dailySummary');

                var DailySummaryService = {
                    getDailySummary: function (user, rangeStart, rangeEnd) {
                        var options = {};
                        if(user) {
                            options.user = user | user.id
                        }
                        if(rangeStart) {
                            options.rangeStart = rangeStart;
                        }
                        if(rangeEnd) {
                            options.rangeEnd = rangeEnd;
                        }
                        return dailySummary.get(options);
                    }
                };
                return DailySummaryService;
            }]);
}());
