(function () {
    'use strict';

    angular.module('yp.dcm')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('dcm.end-of-campaign', {
                        url: "/end",
                        access: accessLevels.user,
                        views: {
                            content: {
                                templateUrl: 'dcm/end-of-campaign/end-of-campaign.html',
                                controller: 'DcmEndOfCampaignController as endOfCampaignController'
                            }
                        },
                        resolve: {

                            jsInclude: ["util", function (util) {
                                return util.loadJSIncludes(['lib/d3/d3.min.js', 'lib/nvd3/nv.d3.min.js']);
                            }]

                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/end-of-campaign/end-of-campaign');
            }])
;

}());