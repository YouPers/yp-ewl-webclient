(function () {
    'use strict';

    angular.module('yp.dcm')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', 'activityResolveConfiguration',
            function ($stateProvider, $urlRouterProvider, accessLevels, activityResolveConfiguration) {
                $stateProvider
                    .state('dcm.activity', {
                        url: "/idea/:idea/activity/:activity/socialInteraction/:socialInteraction/:mode",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'components/activity/activity.html',
                                controller: 'ActivityController as activityController'
                            }
                        },
                        resolve: activityResolveConfiguration
                    });

            }]);

}());