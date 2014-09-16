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
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/home/home');
            }])



        .controller('HomeController', ['$scope', '$rootScope', '$state', 'UserService', 'SocialInteractionService', 'campaign', 'campaigns',
            function ($scope, $rootScope, $state, UserService, SocialInteractionService, campaign, campaigns) {

                $scope.$watch('homeController.filterByPublishDate', function (filterByPublishDate) {
                    var options = {
                        populate: 'author',
                        targetId: campaign.id,
                        authored: true,
                        authorType: 'campaignLead'
                    };

                    if(!filterByPublishDate) {
                        options.publishFrom = false;
                        options.publishTo = false;
                    }

                    SocialInteractionService.getSocialInteractions(options).then(function (sis) {

                        $scope.offers = _.filter(sis, function(si) {
                            return si.__t === 'Recommendation' || si.__t === 'Invitation';
                        });
                        _.each($scope.offers, function (offer) {
                            offer.idea = offer.idea || offer.activity.idea;
                        });

                    });
                });

                $scope.homeController = this;
                $scope.homeController.filterByPublishDate = false;

                if (!campaign && campaigns.length > 0) {
                    $state.go('dcm.home', { campaignId: campaigns[0].id });
                }



                $scope.isOrganizationAdmin = _.contains(UserService.principal.getUser().roles, 'orgadmin');

            }]);
}());