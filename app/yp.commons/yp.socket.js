(function () {
    /*global io:false */
    'use strict';

    angular.module('yp.socket', ['yp.config'])
        .factory('$socket', ['$rootScope', '$timeout', 'yp.config', function ($rootScope, $timeout, config) {
            var socket = io.connect(config.backendUrl);
            return {
                on: function (eventName, callback) {
                    socket.on(eventName, function () {
                        var args = arguments;
                        $timeout(function () {
                            callback.apply(socket, args);
                        }, 0);
                    });
                },
                emit: function (eventName, data, callback) {
                    socket.emit(eventName, data, function () {
                        var args = arguments;
                        $rootScope.$apply(function () {
                            if (callback) {
                                callback.apply(socket, args);
                            }
                        });
                    });
                }
            };
        }]);

}());