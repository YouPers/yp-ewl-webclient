(function () {
    'use strict';


    angular.module('yp.admin')


        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
            function ($stateProvider, $urlRouterProvider, accessLevels) {
                $stateProvider

                    .state('admin.market-partners', {
                        url: "/marketpartners",
                        access: accessLevels.admin,
                        views: {
                            content: {
                                templateUrl: "admin/market-partners/market-partners.html",
                                controller: 'AdminMarketPartnerController as marketController'
                            }
                        },
                        resolve: {
                            partners: ['MarketPartnerService', function(MarketPartnerService) {
                                return MarketPartnerService.getMarketPartners();
                            }]
                        }
                    });
            }])

        .controller('AdminMarketPartnerController', [
            '$scope', '$state', 'partners', 'MarketPartnerService','ImageService',
            function ($scope, $state, partners, MarketPartnerService, ImageService) {
                var self = this;
                this.partners = partners;
                this.newPartner = {};

                this.savePartner = function(partner) {
                    MarketPartnerService.saveMarketPartner(partner).then(function(saved) {
                        if (!partner.id) {
                            partners.push(saved);
                        }
                        self.currentEdit = -999;
                    });
                };

                this.deletePartner = function (partner) {
                    MarketPartnerService.deleteMarketPartner(partner).then(function () {
                        _.remove(self.partners, function(p) {
                            return p.id === (partner.id || partner);
                        });
                    });
                }

                $scope.uploader = ImageService.getImageUploader('marketPartnerLogo', $scope, function successCb (url) {
                    self.partners[self.currentEdit].logo = url;
                });




            }]);


}());