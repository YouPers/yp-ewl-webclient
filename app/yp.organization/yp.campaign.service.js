(function () {
    'use strict';


    angular.module('yp.organization')


        .factory("CampaignService", ['$rootScope', 'Restangular', 'UserService',
            function ($rootScope, Rest, UserService) {

                var campaigns = Rest.all('campaigns');

                var CampaignService = {

                    postCampaign: function(campaign, success, error) {
                        campaigns.post(campaign).then(function(successResult) {
                            $rootScope.$emit('notification:success', 'campaign.save', { values: { campaign: successResult.title }});
                            if(success) {success(successResult);}
                        }, function(errorResult) {
                            $rootScope.$emit('notification:error', errorResult);
                            if(error) {error(errorResult);}
                        });
                    },
                    putCampaign: function(campaign, success, error) {
                        return Rest.restangularizeElement(null, campaign, "campaigns").put().then(function(successResult) {
                            $rootScope.$emit('notification:success', 'campaign.save', { values: { campaign: successResult.title }});
                            if(success) {success(successResult);}
                        }, function(errorResult) {
                            $rootScope.$emit('notification:error', errorResult);
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
                    },
                    getCampaignStats: function (campaignId, type) {
                        var stats = Rest.all('campaigns/' + campaignId + '/stats');

                        return stats.getList({ type: type} );

                    }

                };

                return CampaignService;

            }]);

}());
