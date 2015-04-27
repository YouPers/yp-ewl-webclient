(function () {
    'use strict';


    angular.module('yp.admin')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider

                    .state('admin.messages', {
                        url: "/messages",
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
                    author: UserService.principal.getUser().id,
                    authorType: "productAdmin",
                    publishFrom: new Date()
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

                    // set the start time to the startOf(day) if it is not published today
                    if (!moment($scope.message.publishFrom).isSame(moment(), 'day')) {
                        $scope.message.publishFrom = moment($scope.message.publishFrom).startOf('day').toDate();
                    }

                    $scope.message.publishTo = moment($scope.message.publishTo).endOf('day').toDate();

                    MessageService.postMessage($scope.message).then(function(response) {
                        $scope.messages.unshift(response);
                        $scope.message = _.clone(messageTemplate);
                        $scope.adminMessageForm.$setPristine();
                    });

                };

        }]);


}());