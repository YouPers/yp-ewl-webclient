(function () {
    'use strict';


    angular.module('yp.admin')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('messages', {
                        templateUrl: "layout/admin-default.html",
                        access: accessLevels.admin
                    })

                    .state('messages.content', {
                        url: "/admin/messages",
                        access: accessLevels.admin,
                        views: {
                            content: {
                                templateUrl: "admin/message/messages.html",
                                controller: 'AdminMessagesCtrl'
                            }
                        },
                        resolve: {
                            messages: ['MessageService', function(MessageService) {
                                return MessageService.getMessages({ mode: 'administrate'});
                            }],
                            campaigns: ['CampaignService', function(CampaignService) {
                                return CampaignService.getCampaigns();
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('admin/message/message');

            }])

        .controller('AdminMessagesCtrl', [
            '$scope', '$rootScope', '$filter',
            'UserService', 'MessageService',
            'messages', 'campaigns',

            function ($scope, $rootScope, $filter, UserService, MessageService, messages, campaigns) {


                $scope.messages = messages;
                $scope.campaigns = campaigns;

                var messageTemplate = {
                    targetSpaces: [],
                    author: UserService.principal.getUser().id
                };

                $scope.message = _.clone(messageTemplate);

                $scope.getCampaignLabel = function(space) {
                    return _.find(campaigns, { id: space.targetId }).title;
                };

                $scope.deleteMessage = function deleteMessage(message) {
                    MessageService.deleteMessage(message.id).then(function() {
                        _.remove($scope.messages, { id: message.id });
                    });
                };

                $scope.sendMessage = function sendMessage() {

                    if($scope.message.campaign) {
                        $scope.message.targetSpaces.push({
                            type: 'campaign',
                            targetId: $scope.message.campaign
                        });
                    } else { // system wide message
                        $scope.message.targetSpaces.push({
                            type: 'system'
                        });
                    }

                    MessageService.postMessage($scope.message).then(function(response) {
                        $scope.messages.unshift(response);
                        $scope.message = _.clone(messageTemplate);
                        $scope.adminMessageForm.$setPristine();
                    });

                }

        }]);


}());