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

                    abstract: true,

                    url: "/dcm/campaign/:campaignId",
                    templateUrl: "layout/default.html",
                    controller: 'DcmController as dcmController',

                    access: accessLevels.all,

                    resolve: {
                        campaigns: ['CampaignService', function (CampaignService) {
                            return CampaignService
                                .getCampaigns({populate: 'topic campaignLeads organization marketPartner'})
                                .then(function (campaigns) {
                                    return campaigns;
                                });
                        }],
                        campaign: ['$stateParams', 'campaigns', function ($stateParams, campaigns) {

                            if ($stateParams.campaignId) {
                                return _.find(campaigns, {id: $stateParams.campaignId});
                            } else {
                                return undefined;
                            }

                        }],
                        organization: ['campaign', 'OrganizationService', '$q', function (campaign, OrganizationService, $q) {

                            if (campaign && campaign.organization && campaign.organization.id) {
                                return $q.when(campaign.organization);
                            } else {
                                return OrganizationService.getOrganizations().then(function (list) {
                                    if (!list || list.length === 0) {
                                        return undefined;
                                    } else if (list.length > 1) {
                                        throw new Error('organization not unique');
                                    } else {
                                        return list[0];
                                    }
                                });
                            }

                        }]
                    }
                });

        }])

        .controller('DcmController', ['$scope', '$rootScope', '$state', 'UserService', 'CampaignService', 'organization', 'campaign', 'campaigns',
            function ($scope, $rootScope, $state, UserService, CampaignService, organization, campaign, campaigns) {

                $scope.parentState = 'dcm';

                $scope.currentCampaign = CampaignService.currentCampaign = campaign;

                // my org or the current campaign's org in case I am a product Admin looking at somebody else's campaign
                $scope.organization = organization || campaign.organization;
                $scope.campaigns = campaigns;

                $scope.editCampaign = function editCampaign($event, campaignId) {
                    $state.go('dcm.campaign', {campaignId: campaignId});
                    $event.stopPropagation();
                };

                $scope.canAccess = function (stateName) {
                    return $scope.$state.get(stateName) && UserService.principal.isAuthorized($scope.$state.get(stateName).access);
                };
            }]);

}());