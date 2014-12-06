(function () {
    'use strict';

    angular.module('yp.components.topic', [])

        .factory('TopicService', ['Restangular',
            function (Restangular) {

                var topics = Restangular.all('topics');

                var topicService = {
                    getTopics: function (options) {
                        options = options || {};
                        options.sort = options.sort || 'index';
                        return topics.getList(options);
                    },
                    putTopic: function (topic) {
                        return Restangular.restangularizeElement(null, topic, "topics").put();
                    }
                };
                return topicService;
            }]);

})();