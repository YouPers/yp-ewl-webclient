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

                            socialInteractions: ['$stateParams', 'SocialInteractionService', function ($stateParams, SocialInteractionService) {
                                return SocialInteractionService.getSocialInteractions({
                                    populate: 'author',
                                    targetId: $stateParams.campaignId,
                                    authored: true,
                                    authorType: 'campaignLead'
                                });
                            }],
                            jsInclude: ["util", function (util) {
                                return util.loadJSInclude('lib/d3/d3.js');
                            }]


                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dcm/home/home');
            }])


        .controller('HomeController', ['$scope', '$rootScope', '$state', 'UserService', 'socialInteractions', 'campaign', 'campaigns',
            function ($scope, $rootScope, $state, UserService, socialInteractions, campaign, campaigns) {

                $scope.campaign = campaign;

                if (!campaign && campaigns.length > 0) {
                    $state.go('dcm.home', { campaignId: campaigns[0].id });
                }

                $scope.offers = _.filter(socialInteractions, function (si) {
                    return si.__t === 'Recommendation' || si.__t === 'Invitation';
                });
                _.each($scope.offers, function (offer) {
                    offer.idea = offer.idea || offer.activity.idea;
                });

                $scope.isOrganizationAdmin = _.contains(UserService.principal.getUser().roles, 'orgadmin');

            }])

        .controller('HomeStatsController', ['$scope', 'StatsService', function ($scope, StatsService) {
            $scope.chartData = {};

            init();

            ///////////////////

            function init() {
                if ($scope.campaign) {
                    var options = {
                        runningTotal: true,
                        newestDay: moment.min(moment(), moment($scope.campaign.end)),
                        nrOfDaysToPlot: 7
                    };

                    StatsService.loadStats($scope.campaign.id, {type: 'newUsersPerDay', scopeType: 'campaign', scopeId: $scope.campaign.id}).then(function (result) {
                        $scope.chartData.newUsers = StatsService.fillAndFormatForPlot(result[0].newUsersPerDay, options);
                    });



                    StatsService.loadStats($scope.campaign.id, {type: 'activitiesPlannedPerDay', scopeType: 'campaign', scopeId: $scope.campaign.id}).then(function (result) {
                        $scope.chartData.plannedActs = StatsService.fillAndFormatForPlot(result[0].activitiesPlannedPerDay,  {
                            newestDay: moment(),
                            nrOfDaysToPlot: 7
                        });
                    });
                }
            }

        }]);
}());