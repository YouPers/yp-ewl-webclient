(function () {
    'use strict';


    angular.module('yp.components.campaign')


        .factory("CampaignService", ['$rootScope', 'Restangular', 'UserService',
            function ($rootScope, Rest, UserService) {

                var campaigns = Rest.all('campaigns');

                var CampaignService = {

                    postCampaign: function(campaign) {
                        return campaigns.post(campaign).then(function(postedCampaign) {
                            CampaignService.currentCampaign = postedCampaign;
                            return postedCampaign;
                        });
                    },
                    putCampaign: function(campaign) {
                        return Rest.restangularizeElement(null, campaign, "campaigns").put();
                    },
                    getCampaign: function(campaignId) {
                        return campaigns.one(campaignId).get({populate: 'organization campaignLeads topic'});
                    },
                    getCampaigns: function(options) {
                        return campaigns.getList(options);
                    },
                    inviteCampaignLead: function (email, campaignId) {
                        return campaigns.one(campaignId).all('/inviteCampaignLeadEmail').post({email: email});
                    },
                    assignCampaignLead: function (campaignId, token) {
                        return campaigns.one(campaignId).all('/assignCampaignLead').post('', {token: token}).then(function success(result) {
                            UserService.reload();
                        });
                    },
                    getCampaignStats: function (campaignId, type) {
                        var stats = Rest.all('campaigns/' + campaignId + '/stats');
                        return stats.getList({ type: type });
                    }

                };

                return CampaignService;

            }]);

}());
