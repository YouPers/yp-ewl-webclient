(function () {
    'use strict';

    angular.module('yp.dcm')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('dcm.topics', {
                        url: "/topics",
                        access: accessLevels.orgadmin,
                        views: {
                            content: {
                                templateUrl: 'dcm/topic/topics.html',
                                controller: 'TopicController'
                            }
                        },
                        resolve: {

                            topics: ['Restangular', function(Restangular) {
                                return Restangular.all('topics').getList();
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/topic/topic');
            }])
        .controller('TopicController', [ '$scope', '$state', 'topics', '$sce',
            function ($scope, $state, topics, $sce) {
                if(topics.length < 1) {
                    $scope.$emit('clientmsg:error', 'topics.notFound');
                }
                $scope.topics = topics;

                $scope.getRenderedText = function (text) {
                    if (text) {
                        return $sce.trustAsHtml(marked(text));
                    } else {
                        return "";
                    }
                };
            }
        ]);

}());