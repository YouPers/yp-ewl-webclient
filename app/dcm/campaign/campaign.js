(function () {
    'use strict';

    angular.module('yp.dcm.campaign',
        [
            'restangular',
            'ui.router'
        ])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('campaign', {
                        templateUrl: "layout/default.html",
                        access: accessLevels.all
                    })
                    .state('campaign.content', {
                        url: "/campaign",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dcm/campaign/campaign.html'
                            }
                        },
                        resolve: {

                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/campaign/campaign');
            }]);

}());