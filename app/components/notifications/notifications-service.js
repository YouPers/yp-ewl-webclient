(function () {

    'use strict';

    angular.module('yp.dhc').factory('NotificationService', ['Restangular',
        function (Restangular) {
            var baseUrl = '/notifications';

            var service = {
                getNotifications: function () {
                    return Restangular.all(baseUrl).getList(
                        {populate: 'author',
                            sort: '-created'});
                }
            };

            return service;


        }]);


}())