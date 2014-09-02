(function () {

    'use strict';

    angular.module('yp.components.campaignSwitcher', [])
        .directive('campaignSwitcher', ['$rootScope', '$state','UserService', 'CampaignService',
            function ($rootScope,  $state, UserService, CampaignService) {
            return {
                restrict: 'E',
                scope: {
                    campaign: '='
                },
                templateUrl: 'components/directives/campaign-switcher-directive/campaign-switcher-directive.html',

                link: function (scope, elem, attrs) {


                    function _setCampaignFromUser() {
                        var user = UserService.principal.getUser();
                        scope.campaigns = user.campaign ? [user.campaign] : [];
                        scope.currentCampaign = scope.campaigns && scope.campaigns[0];
                    }

                    function _setCampaignsFromCampaignLead() {
                        if (_.contains(UserService.principal.getUser().roles,'campaignlead')) {
                            CampaignService.getCampaigns().then(function(campaigns) {
                                scope.campaigns = campaigns;
                                if (!CampaignService.currentCampaign) {
                                    CampaignService.currentCampaign = campaigns[0];

                                }
                                scope.currentCampaign = CampaignService.currentCampaign;
                            });
                        } else {
                            scope.campaigns = [];
                            CampaignService.currentCampaign = undefined;
                        }

                    }


                    if (attrs.campaign) {
                        scope.campaigns = [scope.campaign];
                        scope.currentCampaign = CampaignService.currentCampaign || scope.campaigns[0];
                    } else if (attrs.campaigns) {
                        scope.currentCampaign = CampaignService.currentCampaign || scope.campaigns[0];
                    } else if (attrs.mode === 'user'){
                        _setCampaignFromUser();
                    } else if (attrs.mode === 'campaignlead') {
                        _setCampaignsFromCampaignLead();
                    }

                    scope.selectCampaign = function(campaign) {
                        if (attrs.mode === 'campaignlead') {
                            CampaignService.currentCampaign = campaign;
                            scope.currentCampaign = campaign;
                        }
                    };

                    scope.topicName = function () {
                        var topicNames = {
                            '53b416cfa43aac62a2debda1': 'Stress',
                            '53b416fba43aac62a2debda2': 'Nutrition',
                            '53b416fba43aac62a2debda3': 'Fitness'
                        };
                        return topicNames[scope.currentCampaign.topic];
                    };

                    $rootScope.$on('event:authority-deauthorized', function() {
                        scope.campaigns = [];
                    });

                    $rootScope.$on('event:authority-authorized', function() {
                        _setCampaignFromUser();
                    });
                }
            };
        }]);
}());