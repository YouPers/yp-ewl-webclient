(function () {
    'use strict';


    angular.module('yp.dcm',
        [
            'ngSanitize',
            'restangular',
            'ui.router',

            'yp.components'
        ])

        .config(['$stateProvider', 'accessLevels', '$translateWtiPartialLoaderProvider', function($stateProvider, accessLevels, $translateWtiPartialLoaderProvider) {

            $stateProvider
                .state('dcm', {
                    url: "/campaign/:campaignId",
                    templateUrl: "layout/single-column.html",
                    controller: 'DcmController as dcmController',

                    access: accessLevels.all,

                    resolve: {
                        organization: ['OrganizationService', function (OrganizationService) {
                            return OrganizationService.getOrganizations().then(function (list) {
                                if (!list || list.length === 0) {
                                    return undefined;
                                } else if (list.length > 1) {
                                    throw new Error('organization not unique');
                                } else {
                                    return list[0];
                                }
                            });

                        }],
                        campaigns: ['CampaignService', function (CampaignService) {
                            return CampaignService.getCampaigns();
                        }],
                        campaign: ['$stateParams', 'CampaignService', function ($stateParams, CampaignService) {

                            if ($stateParams.campaignId) {
                                return CampaignService.getCampaign($stateParams.campaignId);
                            } else {
                                return undefined;
                            }

                        }]
                    }
                });

            $translateWtiPartialLoaderProvider.addPart('dcm/dcm');
        }]);

}());