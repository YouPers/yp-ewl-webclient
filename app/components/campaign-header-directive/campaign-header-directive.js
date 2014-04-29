(function () {

    'use strict';

    angular.module('yp.dhc')
        .directive('campaignHeader', ['$rootScope', '$state','UserService', 'CampaignService',
            function ($rootScope,  $state, UserService, CampaignService) {
            return {
                restrict: 'E',
                scope: {
                    campaign: '='
                },
                templateUrl: 'components/campaign-header-directive/campaign-header-directive.html',

                link: function (scope, elem, attrs) {


                    function _setCampaignFromUser() {
                        var user = UserService.principal.getUser();
                        scope.campaigns = user.campaign ? [user.campaign] : [];
                    }

                    function _setCampaignsFromCampaignLead() {
                        if (_.contains(UserService.principal.getUser().roles),'campaignlead') {
                            CampaignService.getCampaigns().then(function(campaigns) {
                                scope.campaigns = campaigns;
                                if (!CampaignService.currentCampaign) {
                                    CampaignService.currentCampaign = campaigns[0];
                                    $rootScope.$emit('campaign:currentCampaignChanged');
                                }
                            });
                        } else {
                            scope.campaigns = [];
                            CampaignService.currentCampaign = undefined;
                        }

                    }


                    if (attrs.campaign) {
                        scope.campaigns = [scope.campaign];
                    } else if (attrs.campaigns) {
                        scope.campaigns = scope.campaigns;
                    } else if (attrs.mode === 'user'){
                        _setCampaignFromUser();
                    } else if (attrs.mode === 'campaignlead') {
                        _setCampaignsFromCampaignLead();
                    }

                    scope.isSelected = function(campaign) {
                        return campaign.id === (CampaignService.currentCampaign && CampaignService.currentCampaign.id);
                    };

                    scope.selectCampaign = function(campaign) {
                        if (attrs.mode === 'campaignlead') {
                            CampaignService.currentCampaign = campaign;
                            $rootScope.$emit('campaign:currentCampaignChanged');
                        }
                    };

                    $rootScope.$on('event:authority-deauthorized', function() {
                        scope.campaigns = [];
                    });

                    $rootScope.$on('event:authority-authorized', function() {
                        _setCampaignFromUser();
                    });
                }
            };
        }])
        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('components/campaign-header-directive/campaign-header');
        }]);

}());