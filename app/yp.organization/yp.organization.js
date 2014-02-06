(function () {
    'use strict';


    angular.module('yp.organization', ['ui.router'])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
            function ($stateProvider, $urlRouterProvider, accessLevels) {

                $stateProvider
                    .state('organization', {
                        url: '/organization',
                        templateUrl: 'yp.organization/yp.organization.create.html',
                        controller: 'CreateOrganizationController',
                        access: accessLevels.user,
                        resolve: {

                        }
                    });
            }]);
}());
