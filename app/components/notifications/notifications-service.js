(function () {

    'use strict';

    angular.module('yp.components.notifications')

        .factory('NotificationService', ['Restangular', 'UserService', '$q', function (Restangular, UserService, $q) {
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
                        return $q.when([]);
                    }

                },
                postNotification: function(notification, options) {
                    return Restangular.all(baseUrl).post(notification);
                },

                dismissNotification: function(notification) {
                    return Restangular.one(baseUrl, notification.id || notification).remove();
                },
                deleteNotification: function(notification) {
                    return Restangular.one(baseUrl, notification.id || notification).remove({mode: "administrate"});
                }
            };

            return service;


        }]);


}());