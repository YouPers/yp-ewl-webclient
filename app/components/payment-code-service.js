(function () {
    'use strict';

    angular.module('yp.components.payment-code', [])


        .run(['enums', function (enums) {
            _.merge(enums, {
                relatedService: "YP-Balance".split(' '),
                productType: "CampaignProductType1 CampaignProductType2 CampaignProductType3".split(' ')
            })

        }])

        .factory("PaymentCodeService", ['$rootScope', 'Restangular',
            function ($rootScope, Rest) {

                var paymentResource = Rest.one('paymentcodes');

                var PaymentCodeService = {

                    generatePaymentCode: function(paymentCode) {
                        return paymentResource.post('generate', paymentCode);
                    },
                    validatePaymentCode: function(code) {
                        return paymentResource.post('validate', { code: code });
                    },
                    redeemPaymentCode: function(code, campaign) {
                        return paymentResource.post('redeem', { code: code, campaign: campaign });
                    },
                    getPaymentCodes: function() {
                        return paymentResource.get();
                    }
                };
                return PaymentCodeService;
            }]);

}());
