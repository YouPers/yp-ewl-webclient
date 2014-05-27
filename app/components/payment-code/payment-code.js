(function () {
    'use strict';

    angular.module('yp.components.paymentCode', [])

        .run(['enums', function (enums) {
            _.merge(enums, {
                relatedService: "YP-Balance".split(' '),
                productType: "CampaignProductType1 CampaignProductType2 CampaignProductType3".split(' ')
            });
        }])
    ;

})();