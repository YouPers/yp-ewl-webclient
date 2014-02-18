(function () {
    'use strict';


    angular.module('yp.organization')


        .factory("CampaignService", ['$rootScope', 'Restangular', 'UserService',
            function ($rootScope, Rest, UserService) {

                var campaigns = Rest.all('campaigns');

                var CampaignService = {

                    postCampaign: function(campaign, success, error) {
                        campaigns.post(campaign).then(function(successResult) {
                            $rootScope.$broadcast('globalUserMsg', 'Campaign ' + successResult.title + ' successfully created', 'success', 3000);
                            if(success) {success(successResult);}
                        }, function(errorResult) {
                            $rootScope.$broadcast('globalUserMsg', 'Campaign not created: Error: ' + errorResult.data.message, 'danger', 3000);
                            if(error) {error(errorResult);}
                        });
                    },
                    putCampaign: function(campaign) {
                        return Rest.restangularizeElement(null, campaign, "campaigns").put().then(function(successResult) {
                            $rootScope.$broadcast('globalUserMsg', 'Campaign ' + successResult.title + ' successfully updated', 'success', 3000);
                            if(success) {success(successResult);}
                        }, function(errorResult) {
                            $rootScope.$broadcast('globalUserMsg', 'Campaign not updated: Error: ' + errorResult.data.message, 'danger', 3000);
                            if(error) {error(errorResult);}
                        });
                    },
                    getCampaign: function(campaignId) {
                        return campaigns.one(campaignId).get({populate: 'organization campaignLeads'});
                    },
                    getCampaigns: function() {
                        return campaigns.getList();
                    },
                    inviteCampaignLead: function (email, campaignId) {
                        return campaigns.one(campaignId).all('/inviteCampaignLeadEmail').post({email: email});
                    },
                    assignCampaignLead: function (campaignId, token) {
                        return campaigns.one(campaignId).all('/assignCampaignLead').post('', {token: token}).then(function success(result) {
                            UserService.reload();
                        });
                    }
                };

                return CampaignService;

            }]);

}());
