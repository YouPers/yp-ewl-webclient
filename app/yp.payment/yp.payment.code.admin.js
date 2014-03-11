(function () {
    'use strict';


    angular.module('yp.payment')


        .controller('PaymentCodeAdminController', ['$rootScope', '$scope', 'PaymentCodeService',
            function ($rootScope, $scope, PaymentCodeService) {

                $scope.validate = function(code) {
                    PaymentCodeService.validatePaymentCode(code).then(function(result) {
                        $scope.value = result.value;
                        $scope.valid = true;
                    }, function(reason) {
                        $scope.valid = false;
                    });
                };
                $scope.generate = function(value) {
                    console.log('value: ' + value);
                    PaymentCodeService.generatePaymentCode(value).then(function(result) {
                        $scope.codes = $scope.codes || {};
                        $scope.codes[result.code] = value;

                        $scope.code = result.code;
                        $scope.valid = true;
                    });
                };

                $scope.value = '1234';
            }]);
}());
