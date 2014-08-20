(function () {
    'use strict';

    angular.module('yp.dcm')

        .config(['$stateProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('dcm.home', {
                        url: "/home",
                        templateUrl: "layout/single-column.html",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dcm/home/home.html',
                                controller: 'HomeController as homeController'
                            }

                        },
                        resolve: {

                            socialInteractions: ['$stateParams', 'SocialInteractionService', function($stateParams, SocialInteractionService) {
                                return SocialInteractionService.getSocialInteractions({ populate: 'author', campaign: $stateParams.id });
                            }]

                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/home/home');
            }])

        .controller('DcmController', ['$scope', '$rootScope', '$state', 'UserService', 'CampaignService', 'organization', 'campaign', 'campaigns',
            function ($scope, $rootScope, $state, UserService, CampaignService, organization, campaign, campaigns) {

                if(!campaign && campaigns.length > 0) {
                    $state.go('dcm.home', { campaignId: campaigns[0].id });
                }

                $scope.organization = organization;
                $scope.currentCampaign = campaign;
                $scope.campaigns = campaigns;

                $scope.editCampaign = function editCampaign($event, campaignId) {
                    $state.go('dcm.campaign', { id: campaignId });
                    $event.stopPropagation();
                };

                $scope.canAccess = function (stateName) {
                    return $scope.$state.get(stateName) && UserService.principal.isAuthorized($scope.$state.get(stateName).access);
                };


            }])


        .controller('HomeController', ['$scope', '$rootScope', '$state', 'UserService', 'socialInteractions',
            function ($scope, $rootScope, $state, UserService, socialInteractions) {

                $scope.socialInteractions = socialInteractions;


            }]);
}());