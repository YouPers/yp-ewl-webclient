(function () {
    'use strict';

    angular.module('yp.components')

        .run(['ErrorService', 'Restangular', function (ErrorService, Restangular) {

            Restangular.setErrorInterceptor(ErrorService.defaultErrorCallback);
        }])

        .factory("ErrorService", ['$q', '$rootScope', function($q, $rootScope) {

            return({
                defaultErrorCallback: function(reason) {
                    $rootScope.$emit('clientmsg:error', reason, { type: 'warn' });
                    return $q.reject(reason);
                }
            });

        }]);

}());