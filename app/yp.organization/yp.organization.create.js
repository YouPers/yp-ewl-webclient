(function () {
    'use strict';


    angular.module('yp.organization')


        .controller('CreateOrganizationController', ['$rootScope', '$scope', '$timeout', 'OrganizationService', 'CampaignService',
            function ($rootScope, $scope, $timeout, OrganizationService, CampaignService) {

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
                $scope.minDateStart = moment();
                // we assume, that a campaign ideally lasts at least 3 weeks
                $scope.minDateEnd = moment($scope.minDateStart).add('week',3);;

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
                    var startDate = moment($scope.campaignObj.start);
                    var endDate = moment($scope.campaignObj.end);
                    if (startDate.diff(endDate) < 0) {
                        // start date is earlier than end date, so we try to create the campaign

                        $scope.campaignObj.organization = $scope.organization.id;
                        CampaignService.postCampaign($scope.campaignObj, function(campaign, campaignObj) {
                            $scope.campaigns.push (campaign);
                            $scope.campaignObj = null;
                            $scope.campaignObj = {};
                        });
                    } else {
                        $rootScope.$broadcast('globalUserMsg', 'Campaign not created: Campaign end date must be later than campaign start date ');
                    }
                };

            }]);
}());
