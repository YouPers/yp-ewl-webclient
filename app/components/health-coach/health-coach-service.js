(function () {

    'use strict';

    angular.module('yp.dhc').factory('HealthCoachService', ['Restangular',
        function (Restangular) {
            var baseUrl = '/coachmessages';

            var service = {
                getCoachMessages: function(uistate) {
                    return Restangular.all(baseUrl, {uistate: uistate});
                }
            };

            return service;


        }]);



}());