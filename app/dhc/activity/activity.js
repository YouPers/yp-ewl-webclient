(function () {
    'use strict';

    angular.module('yp.dhc')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', 'activityResolveConfiguration',
            function ($stateProvider, $urlRouterProvider, accessLevels, activityResolveConfiguration) {
                $stateProvider
                    .state('dhc.activity', {
                        parent: 'dhc',
                        url: "/idea/:idea/activity/:activity/socialInteraction/:socialInteraction?edit",
                        access: accessLevels.user,
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