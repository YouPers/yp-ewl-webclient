(function () {

    'use strict';

    angular.module('yp.components.notifications')
        .directive('notifications', ['$rootScope', 'NotificationService', 'CampaignService', '$state','accessLevels',
            function ($rootScope, NotificationService, CampaignService, $state, accessLevels) {
                return {
                    restrict: 'E',
                    scope: {},
                    templateUrl: 'components/notifications/notifications-directive.html',

                    link: function (scope, elem, attrs) {

                        scope.dismiss = function (notification) {
                            _.remove(scope.notifications, function(nf) {
                                return nf.id === notification.id;
                            });
                            NotificationService.dismissNotification(notification);
                        };

                        if ($state.current.access === accessLevels.campaignlead) {
                            // this is screen where only campaignLeads have access and a currentCampaign is set
                            // so we show the preview Version
                            scope.preview = {
                                campaign: CampaignService.currentCampaign,
                                previewdate: new Date()
                                };

                            scope.dateOptions = {
                                'year-format': "'yyyy'",
                                'starting-day': 1
                            };


                            if (CampaignService.currentCampaign) {

                                NotificationService.getNotifications({campaign: CampaignService.currentCampaign.id, mode: 'preview'}).then(function (result) {
                                    scope.notifications = result;
                                });
                            }

                            scope.$watch(function() {return CampaignService.currentCampaign;}, function(newCampaign, old) {
                                if (CampaignService.currentCampaign && CampaignService.currentCampaign.id) {
                                    NotificationService.getNotifications({campaign: CampaignService.currentCampaign.id, mode: 'preview', previewdate: moment(scope.preview.previewdate).toISOString()}).then(function (result) {
                                        scope.notifications = result;
                                    });
                                }
                            });

                            scope.$watch(function() {return scope.preview.previewdate;}, function(newDate) {
                                if (CampaignService.currentCampaign && CampaignService.currentCampaign.id) {
                                    NotificationService.getNotifications({campaign: CampaignService.currentCampaign.id, mode: 'preview', previewdate: moment(scope.preview.previewdate).toISOString()}).then(function (result) {
                                        scope.notifications = result;
                                    });
                                }
                            });


                        } else {
                            NotificationService.getNotifications().then(function (result) {
                                scope.notifications = result;
                            });
                        }
                    }
                };
            }]);

}());