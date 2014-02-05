(function () {
    'use strict';


    angular.module('yp.organization')


        .controller('CreateOrganizationController', ['$scope', '$timeout', 'OrganizationService', 'CampaignService',
            function ($scope, $timeout, OrganizationService, CampaignService) {

                var getOrganizations = function() {
                    OrganizationService.getOrganizations().then(function(organizations) {
                        $scope.organization = organizations[0];
                    });
                };
                getOrganizations();


                $scope.organization = {};

                $scope.createOrganization = function() {
                    OrganizationService.postOrganization($scope.organizationObj, function(organization) {
                        $scope.organization = organization;
                    });
                };


                var getCampaigns = function() {
                    CampaignService.getCampaigns().then(function(campaigns) {
                        $scope.campaigns = campaigns;
                    });
                };
                getCampaigns();

                // one time planning using daypicker
                $scope.showWeeks = false;
                $scope.minDate = moment();

                $scope.openStart = function () {
                    $timeout(function () {
                        $scope.startOpened = true;
                    });
                };

                $scope.openEnd = function () {
                    $timeout(function () {
                        $scope.endOpened = true;
                    });
                };
                $scope.dateOptions = {
                    'year-format': "'yy'",
                    'starting-day': 1
                };

                $scope.formatDate = function (dateToBeFormatted) {
                    return moment(dateToBeFormatted).format("DD.MM.YYYY");
                }

                $scope.campaignObj = {};

                $scope.createCampaign = function() {
                    $scope.campaignObj.organization = $scope.organization.id;
                    CampaignService.postCampaign($scope.campaignObj, function(campaign) {
                        $scope.campaigns.push (campaign);
                    });
                };

            }]);
}());
