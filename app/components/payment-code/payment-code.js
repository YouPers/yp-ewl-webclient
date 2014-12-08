(function () {
    'use strict';

    angular.module('yp.components.paymentCode', [])

        .run(['$rootScope', function ($rootScope) {
            _.merge($rootScope.enums, {
                productType: "type1 type2 type3".split(' ')
            });
        }])
    ;

})();