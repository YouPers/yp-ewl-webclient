(function () {
    'use strict';

    angular.module('yp.dcm.home',
        [
            'restangular',
            'ui.router'
        ])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('dcm-home', {
                        templateUrl: "layout/dcmdefault.html",
                        access: accessLevels.all
                    })
                    .state('dcm-home.content', {
                        url: "/campaign/home",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dcm/home/home.html',
                                controller: 'DcmHomeController'
                            }
                        },
                        resolve: {

                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/home/home');
            }])

        .controller('DcmHomeController', ['$scope', 'UserService', 'CampaignService',
            function($scope, UserService, CampaignService) {

            $scope.canAccess = function(stateName) {
                return $scope.$state.get(stateName) && UserService.principal.isAuthorized($scope.$state.get(stateName).access );
            };


            $scope.$watch(CampaignService.currentCampaign, function(newValue, oldValue) {
                $scope.currentCampaign =  CampaignService.currentCampaign;
            });

        }]);
}());