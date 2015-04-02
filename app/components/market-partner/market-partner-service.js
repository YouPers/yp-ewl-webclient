(function () {
    'use strict';

    angular.module('yp.components.marketPartner')

        .factory("MarketPartnerService", ['$rootScope', 'Restangular',
            function ($rootScope, Rest) {

                var marketPartnerResource = Rest.all('marketpartners');

                var MarketPartnerService = {

                    getMarketPartners: function(options) {
                        return marketPartnerResource.getList(options);
                    },
                    getMarketPartner: function(id, options) {
                        return marketPartnerResource.one(id).get(options);
                    },
                    saveMarketPartner: function(partner) {
                        if (partner.id) {
                            return Rest.restangularizeElement(null, partner, 'marketpartners').put();
                        } else {
                            return Rest.restangularizeElement(null, partner, 'marketpartners').post();
                        }
                    },
                    deleteMarketPartner: function(partner) {
                        return marketPartnerResource.one(partner.id || partner).remove();
                    }
                };
                return MarketPartnerService;
            }]);

}());
