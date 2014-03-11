(function () {
    'use strict';

    angular.module('yp.payment')

        .factory("PaymentCodeService", ['$rootScope', 'Restangular',
            function ($rootScope, Rest) {

                var paymentResource = Rest.one('paymentcode');

                var PaymentCodeService = {

                    generatePaymentCode: function(paymentCode) {
                        return paymentResource.post('generate', paymentCode);
                    },
                    validatePaymentCode: function(code) {
                        return paymentResource.post('validate', { code: code });
                    },
                    redeemPaymentCode: function(code, campaign) {
                        return paymentResource.post('redeem', { code: code, campaign: campaign });
                    }
                };
                return PaymentCodeService;
            }]);

}());
