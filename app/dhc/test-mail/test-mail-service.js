(function () {
    'use strict';


    angular.module('yp.dhc')

        .factory("TestMailService", ['ErrorService', 'Restangular',
            function (ErrorService, Rest) {

                var TestMailService = {
                    getMail: function (mailType, options) {
                        return Rest.one(mailType).get(options);
                    },
                    sendMail: function (mailType, options) {
                        return Rest.all(mailType).post({}, options);
                    }
                };
                return TestMailService;
            }]);
}());
