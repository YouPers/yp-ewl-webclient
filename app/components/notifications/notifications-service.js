(function () {

    'use strict';

    angular.module('yp.dhc').factory('NotificationService', ['Restangular', 'UserService', '$q',
        function (Restangular, UserService, $q) {
            var baseUrl = '/notifications';

            var service = {
                getNotifications: function (options) {
                    options.populate = 'author';
                    options.sort = 'created:-1';

                    if (UserService.principal.isAuthenticated()) {
                        return Restangular.all(baseUrl).getList(options);
                    } else {
                        var deferred = $q.defer();
                        deferred.resolve([]);
                        return deferred.promise;
                    }

                }
            };

            return service;


        }]);


}());