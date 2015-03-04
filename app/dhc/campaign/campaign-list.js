(function () {
    'use strict';

    angular.module('yp.dhc')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('campaign-list', {
                        url: "/campaign-list",
                        templateUrl: 'dhc/campaign/campaign-list.html',
                        controller: 'CampaignListController',
                        access: accessLevels.all,
                        resolve: {
                            campaigns: ['CampaignService', function(CampaignService) {
                                return CampaignService.getCampaigns({listall: true});
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/campaign/campaign');

            }])


        .controller('CampaignListController', [ '$scope', 'campaigns',
            function ($scope, campaigns) {

                $scope.campaigns = _.filter(campaigns, function(campaign) {
                    return moment().isAfter(moment(campaign.start)) &&
                        moment().isBefore(moment(campaign.end));
                });

        }]);

}());