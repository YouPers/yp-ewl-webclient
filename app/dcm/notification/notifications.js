(function () {
    'use strict';

    angular.module('yp.dcm')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('notifications', {
                        templateUrl: "layout/dcm-default.html",
                        access: accessLevels.campaignlead
                    })
                    .state('notifications.content', {
                        url: "/notifications",
                        access: accessLevels.campaignlead,
                        views: {
                            content: {
                                templateUrl: 'dcm/notification/notifications.html',
                                controller: 'NotificationsController'
                            }
                        },
                        resolve: {

                            notifications: ['$stateParams', 'NotificationService', 'CampaignService',
                                function ($stateParams, NotificationService, CampaignService) {
                                    return NotificationService.getNotifications({campaign: (CampaignService.currentCampaign && CampaignService.currentCampaign.id) || undefined, mode: 'administrate'});
                                }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/notification/notification');
            }])

        .controller('NotificationsController', [ '$scope', '$rootScope', 'CampaignService', 'NotificationService', 'notifications',
            function ($scope, $rootScope, CampaignService, NotificationService, notifications) {

                $scope.notifications = notifications;

                $scope.showWeeks = false;
                $scope.minDate = new Date();

                $scope.dateOptions = {
                    'year-format': "'yy'",
                    'starting-day': 1
                };

                $scope.notificationObj = {
                    publishFrom: new Date(moment().startOf('day')),
                    publishTo: new Date(moment().endOf('day')),
                    type: 'message',
                    author: $scope.principal.getUser(),
                    sourceType: 'campaign',
                    targetQueue: CampaignService.currentCampaign && CampaignService.currentCampaign.id
                };

                $scope.saveNotification = function() {
                    // reset targetQueue, user might have changed the currentCampaign
                    $scope.notificationObj.targetQueue = CampaignService.currentCampaign.id;
                    NotificationService.postNotification($scope.notificationObj).then(function(saved) {
                        $scope.notifications.unshift(saved);
                        $scope.addNotification = false;
                        $scope.notificationObj.title = '';
                        $scope.notificationObj.text = '';
                    });
                };

                $scope.deleteNotification = function(notification) {
                    NotificationService.deleteNotification(notification).then(function() {
                        _.remove($scope.notifications, function(not) {
                            return not.id === notification.id;
                        });
                    });
                };

                $scope.$watch(function(){return CampaignService.currentCampaign;}, function(newValue, oldValue) {
                    NotificationService.getNotifications(
                        {campaign: CampaignService.currentCampaign.id,
                            populate: 'author', mode: 'administrate'}
                    ).then(function (notifications) {
                            $scope.notifications = notifications;
                        });                });
            }
        ]);


}());