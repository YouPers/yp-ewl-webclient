(function () {

    'use strict';

    angular.module('yp.dhc').factory('NotificationService', ['Restangular', 'UserService', '$q',
        function (Restangular, UserService, $q) {
            var baseUrl = '/notifications';

            var service = {
                getNotifications: function () {
                    if (UserService.principal.isAuthenticated()) {
                        return Restangular.all(baseUrl).getList(
                            {populate: 'author',
                                sort: 'created:-1'});
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