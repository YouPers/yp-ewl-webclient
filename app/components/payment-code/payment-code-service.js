(function () {
    'use strict';

    angular.module('yp.components.paymentCode')

        .factory("PaymentCodeService", ['$rootScope', 'Restangular',
            function ($rootScope, Rest) {

                var paymentResource = Rest.one('paymentcodes');

                var PaymentCodeService = {

                    generatePaymentCode: function(paymentCode) {
                        return paymentResource.post('generate', paymentCode);
                    },
                    validatePaymentCode: function(options) {
                        return paymentResource.post('validate', options);
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
