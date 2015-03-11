(function () {
    'use strict';

    angular.module('yp.components.paymentCode')

        .factory("PaymentCodeService", ['$rootScope', 'Restangular',
            function ($rootScope, Rest) {

                var paymentResource = Rest.all('paymentcodes');

                var PaymentCodeService = {

                    generatePaymentCode: function(paymentCode) {
                        return paymentResource.all('generate').post( paymentCode);
                    },
                    validatePaymentCode: function(options) {
                        return paymentResource.all('validate').post(options);
                    },
                    redeemPaymentCode: function(code, campaign) {
                        return paymentResource.all('redeem').post({ code: code, campaign: campaign });
                    },
                    getPaymentCodes: function(options) {
                        return paymentResource.getList(options);
                    },
                    deletePaymentCode: function(id) {
                        return paymentResource.one(id).remove();
                    }
                };
                return PaymentCodeService;
            }]);

}());
