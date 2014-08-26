(function () {
    'use strict';

    angular.module('yp.dcm')

        .config(['$stateProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('dcm.home', {
                        url: "/home",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dcm/home/home.html',
                                controller: 'HomeController as homeController'
                            }

                        },
                        resolve: {

                            socialInteractions: ['$stateParams', 'SocialInteractionService', function($stateParams, SocialInteractionService) {
                                return SocialInteractionService.getSocialInteractions({
                                    populate: 'author',
                                    targetId: $stateParams.campaignId,
                                    authored: true,
                                    authorType: 'campaignLead'
                                });
                            }]

                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/home/home');
            }])



        .controller('HomeController', ['$scope', '$rootScope', '$state', 'UserService', 'socialInteractions',
            function ($scope, $rootScope, $state, UserService, socialInteractions) {

                $scope.socialInteractions = socialInteractions;


            }]);
}());