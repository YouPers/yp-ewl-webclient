(function () {

    'use strict';

    angular.module('yp.dhc').factory('NotificationService', ['Restangular', 'UserService', '$q',
        function (Restangular, UserService, $q) {
            var baseUrl = 'notifications';

            var service = {
                getNotifications: function (options) {
                    if (!options) {
                        options = {};
                    }
                    options.populate = 'author';
                    options.sort = 'created:-1';

                    if (UserService.principal.isAuthenticated()) {
                        return Restangular.all(baseUrl).getList(options);
                    } else {
                        var deferred = $q.defer();
                        deferred.resolve([]);
                        return deferred.promise;
                    }

                },
                postNotification: function(notification, options) {
                    return Restangular.all(baseUrl).post(notification);
                },
                deleteNotification: function(notification) {
                    return Restangular.one(baseUrl, notification.id || notification).remove();
                }
            };

            return service;


        }]);


}());