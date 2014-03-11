(function () {
    'use strict';

    angular.module('yp.error', [])

        .run(['ErrorService', 'Restangular', function (ErrorService, Restangular) {

            Restangular.setErrorInterceptor(ErrorService.defaultErrorCallback);
        }])

        .factory("ErrorService", ['$q', '$rootScope', function($q, $rootScope) {

            return({
                defaultErrorCallback: function(reason) {
                    $rootScope.$emit('notification:error', reason);
                    return $q.reject(reason);
                }
            });

        }]);

}());