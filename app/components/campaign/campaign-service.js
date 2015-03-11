(function () {
    'use strict';


    angular.module('yp.components.campaign')


        .factory("CampaignService", ['$rootScope', 'Restangular', 'UserService',
            function ($rootScope, Rest, UserService) {

                var campaigns = Rest.all('campaigns');

                var CampaignService = {

                    postCampaign: function(campaign, options) {
                        return campaigns.post(campaign, options).then(function(postedCampaign) {
                            CampaignService.currentCampaign = postedCampaign;
                            return postedCampaign;
                        });
                    },
                    putCampaign: function(campaign) {
                        return Rest.restangularizeElement(null, campaign, "campaigns").put();
                    },
                    getCampaign: function(campaignId) {
                        return campaigns.one(campaignId).get({populate: ['organization', 'campaignLeads', 'topic']});
                    },
                    getCampaigns: function(options) {
                        return campaigns.getList(options);
                    },
                    deleteCampaign: function(campaign) {
                        return campaigns.one(campaign.id || campaign).remove();
                    },
                    inviteCampaignLead: function (email, campaignId) {
                        return campaigns.one(campaignId).all('/inviteCampaignLeadEmail').post({email: email});
                    },
                    assignCampaignLead: function (campaignId, token) {
                        return campaigns.one(campaignId).all('/assignCampaignLead').post('', {token: token}).then(function success(result) {
                            UserService.reload();
                        });
                    },
                    inviteParticipants: function(campaignId, particpantEmails, mailSubject, mailText, testOnly) {
                        var postBody = {email: particpantEmails,
                            subject: mailSubject,
                            text: mailText};
                        if (testOnly) {
                            postBody.testOnly = true;
                        }
                        return campaigns.one(campaignId).all('inviteParticipantsEmail')
                            .post(postBody);
                    }

                };

                return CampaignService;

            }]);

}());
