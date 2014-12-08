(function () {
    'use strict';

    angular.module('yp.components.paymentCode', [])

        .run(['$rootScope', function ($rootScope) {
            _.merge($rootScope.enums, {
                productType: "CampaignProductType1 CampaignProductType2 CampaignProductType3".split(' ')
            });
        }])
    ;

})();