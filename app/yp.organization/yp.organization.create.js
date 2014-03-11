(function () {
    'use strict';


    angular.module('yp.organization')


        .controller('CreateOrganizationController', ['$rootScope', '$scope', '$timeout', 'OrganizationService', 'CampaignService',
            function ($rootScope, $scope, $timeout, OrganizationService, CampaignService) {


                $scope.inviteOrganizationAdmin = function(emails,organization) {
                    OrganizationService.inviteOrganizationAdmin(emails, organization.id).then(function() {
                        $scope.invitationSent = true;
                    });
                };

                var getOrganizations = function() {
                    OrganizationService.getOrganizations().then(function(organizations) {
                        $scope.organization = organizations[0];
                    });
                };
                getOrganizations();

                $scope.organization = {};

                $scope.createOrganization = function() {
                    OrganizationService.postOrganization($scope.organizationObj).then(function(organization) {
                        $scope.organization = organization;
                    });
                };

                // Campaign specifics
                var getCampaigns = function() {

                    if(_.contains($scope.principal.getUser().roles, 'orgadmin')) {
                        CampaignService.getCampaigns().then(function(campaigns) {
                            $scope.campaigns = campaigns;
                        });
                    } else {
                        $scope.campaigns = [];
                    }


                };

                getCampaigns();

                $scope.formatDate = function (dateToBeFormatted) {
                    return moment(dateToBeFormatted).format("DD.MM.YYYY");
                };

                var initCampaign = function() {

                    $scope.minDateStart = new Date(moment().hour(8).minutes(0).seconds(0));
                    // we assume, that a campaign ideally lasts at least 6 weeks
                    $scope.minDateEnd = new Date(moment().hour(17).minutes(0).seconds(0).add('week',6));

                    $scope.campaignObj = {
                        start: $scope.minDateStart,
                        end: $scope.minDateEnd
                    };

                };

                initCampaign();

                // date picker and date picker pop up settings

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

                // validate and store a new campaign

                $scope.createCampaign = function() {
                    var startDate = moment($scope.campaignObj.start);
                    var endDate = moment($scope.campaignObj.end);
                    if (startDate.diff(endDate) < 0) {
                        // start date is earlier than end date, so we try to create the campaign

                        $scope.campaignObj.organization = $scope.organization.id;
                        CampaignService.postCampaign($scope.campaignObj).then(function(campaign) {
                            $scope.campaigns.push (campaign);
                            $scope.campaignObj = null;
                            initCampaign();
                        });
                    } else {
                        $rootScope.$emit('notification:error', 'campaign.dateRange');
                    }
                };


            }]);
}());
