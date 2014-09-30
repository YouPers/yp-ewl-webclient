(function () {

    'use strict';

    angular.module('yp.components.healthCoach')
        .factory('HealthCoachService', ['$state',
        function ($state) {

            var queuedMessage = undefined;

            var service = {

                queueMessage: function (message) {


                },
                getQueuedMessage: function () {
                    var message = _.clone(queuedMessage);
                    queuedMessage = undefined;
                    return message;
                }

            };

            return service;


        }]);



}());