(function () {
    'use strict';

    angular.module('yp.dhc')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', 'activityResolveConfiguration',
            function ($stateProvider, $urlRouterProvider, accessLevels, activityResolveConfiguration) {
                $stateProvider
                    .state('dhc.activity', {
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