(function () {
    'use strict';


    angular.module('yp.admin')


        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
            function ($stateProvider, $urlRouterProvider, accessLevels) {
                $stateProvider

                    .state('admin.campaigns', {
                        url: "/campaigns",
                        access: accessLevels.admin,
                        views: {
                            content: {
                                templateUrl: "admin/campaigns/campaigns.html",
                                controller: 'AdminCampaignsCtrl'
                            }
                        },
                        resolve: {
                            campaigns: ['CampaignService', function(CampaignService) {
                                return CampaignService.getCampaigns({ populate: 'organization campaignLeads' });
                            }]
                        }
                    });
            }])

        .controller('AdminCampaignsCtrl', [
            '$scope', '$state', 'campaigns',
            function ($scope, $state, campaigns) {

                $scope.campaigns = campaigns;
                $scope.open = function (campaign) {
                    $state.go('dcm.home', { campaignId: campaign.id});
                };

        }]);


}());