(function () {
    'use strict';

    angular.module('yp.error', [])

        .factory("ErrorService", ['$q', '$rootScope', function($q, $rootScope) {


            return({
                defaultErrorCallback: function(reason) {
                    $rootScope.$emit('notification:log', reason);
                    return $q.reject(reason);
                }
            });

        }])

}());