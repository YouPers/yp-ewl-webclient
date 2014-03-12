(function () {
    'use strict';


    angular.module('yp.payment')


        .controller('PaymentCodeAdminController', ['$rootScope', '$scope', 'PaymentCodeService', 'CampaignService',
            function ($rootScope, $scope, PaymentCodeService) {


                $scope.validate = function(code) {
                    PaymentCodeService.validatePaymentCode(code).then(function(result) {
                        $scope.paymentCode = result;
                        $scope.valid = true;
                    }, function(reason) {
                        $scope.valid = false;
                    });
                };

                $scope.generate = function(paymentCode) {
                    console.log('paymentCode: ' + paymentCode);

                    PaymentCodeService.generatePaymentCode(paymentCode).then(function(result) {
                        $scope.codes = $scope.codes || {};
                        $scope.codes[result.code] = paymentCode;

                        $scope.code = result.code;
                        $scope.valid = true;
                    });
                };

                $scope.paymentCode = {
                    productType: $rootScope.enums.productType[0],
                    relatedService: $rootScope.enums.relatedService[0]
                };
            }]);
}());
