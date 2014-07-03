(function () {
    'use strict';


    angular.module('yp.components.message')


        .factory("MessageService", ['ErrorService', 'Restangular',
            function (ErrorService, Rest) {

                var messages = Rest.all('messages');

                var MessageService = {
                    putMessage: function(message) {
                        return message.put();
                    },
                    postMessage: function(message) {
                        return messages.post(message);
                    },
                    getMessage: function(messageId) {
                        return messages.one(messageId);
                    },
                    getMessages: function(options) {
                        return messages.getList(options);
                    },
                    deleteMessage: function(messageId) {
                        return messages.one(messageId).remove();
                    }
                };
                return MessageService;
            }]);
}());
