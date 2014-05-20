(function () {

    'use strict';

    angular.module('yp.dhc')
        .directive('campaignSwitcher', ['$rootScope', '$state','UserService', 'CampaignService',
            function ($rootScope,  $state, UserService, CampaignService) {
            return {
                restrict: 'E',
                scope: {
                    campaign: '='
                },
                templateUrl: 'components/campaign-switcher-directive/campaign-switcher-directive.html',

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
                        scope.campaigns = scope.campaigns;
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
            $translateWtiPartialLoaderProvider.addPart('components/campaign-switcher-directive/campaign-switcher');
        }]);

}());