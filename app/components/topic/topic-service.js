(function () {
    'use strict';

    angular.module('yp.components.topic', [])

        .factory('TopicService', ['Restangular',
            function (Restangular) {

                var topics = Restangular.all('topics');

                var topicService = {
                    getTopics: function (options) {
                        return topics.getList(options);
                    },
                    putTopic: function (topic) {
                        return Restangular.restangularizeElement(null, topic, "topics").put();
                    }
                };
                return topicService;
            }]);

})();