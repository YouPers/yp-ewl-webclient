(function () {

    'use strict';

    angular.module('yp.components.healthCoach')
        .factory('HealthCoachService', ['$state',
        function ($state) {

            var queuedEvent = undefined;

            var service = {

                queueEvent: function (event) {
                    queuedEvent = event;
                },
                getQueuedEvent: function () {
                    var event = _.clone(queuedEvent);
                    queuedEvent = undefined;
                    return event;
                }

            };

            return service;


        }]);



}());