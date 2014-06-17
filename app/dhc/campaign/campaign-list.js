(function () {
    'use strict';

    angular.module('yp.dhc')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('campaign-list', {
                        templateUrl: "layout/default.html",
                        access: accessLevels.all
                    })
                    .state('campaign-list.content', {
                        url: "/campaign-list",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dhc/campaign/campaign-list.html',
                                controller: 'CampaignListController'
                            }
                        },
                        resolve: {
                            campaigns: ['CampaignService', function(CampaignService) {
                                return CampaignService.getCampaigns();
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/campaign/campaign');

            }])


        .controller('CampaignListController', [ '$scope', 'campaigns',
            function ($scope, campaigns) {
                $scope.campaigns = campaigns;
        }]);

}());