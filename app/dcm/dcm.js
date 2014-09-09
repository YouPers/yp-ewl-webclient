(function () {
    'use strict';


    angular.module('yp.dcm',
        [
            'ngSanitize',
            'restangular',
            'ui.router',

            'yp.components'
        ])

        .config(['$stateProvider', 'accessLevels', '$translateWtiPartialLoaderProvider', function ($stateProvider, accessLevels, $translateWtiPartialLoaderProvider) {

            $stateProvider
                .state('dcm', {
                    url: "/dcm/campaign/:campaignId",
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
                            return CampaignService.getCampaigns({ populate: 'topic' });
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

        }])

        .controller('DcmController', ['$scope', '$rootScope', '$state', 'UserService', 'CampaignService', 'organization', 'campaign', 'campaigns',
            function ($scope, $rootScope, $state, UserService, CampaignService, organization, campaign, campaigns) {

                $scope.parentState = 'dcm';

                $scope.organization = organization;
                $scope.currentCampaign = campaign;
                $scope.campaigns = campaigns;

                $scope.editCampaign = function editCampaign($event, campaignId) {
                    $state.go('dcm.campaign', { campaignId: campaignId });
                    $event.stopPropagation();
                };

                $scope.canAccess = function (stateName) {
                    return $scope.$state.get(stateName) && UserService.principal.isAuthorized($scope.$state.get(stateName).access);
                };
            }]);

}());