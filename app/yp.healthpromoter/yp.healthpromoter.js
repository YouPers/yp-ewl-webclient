'use strict';

angular.module('yp.healthpromoter', ['restangular', 'ui.router', 'yp.user'])

    .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
        function ($stateProvider, $urlRouterProvider, accessLevels) {
            $stateProvider
                .state('healthpromoter', {
                    url: "/hp",
                    templateUrl: "yp.healthpromoter/yp.healthpromoter.html",
                    controller: "HealthPromoterCtrl",
                    access: accessLevels.all
                })
                .state('newcampaign', {
                    url: "/newcampaign",
                    templateUrl: "yp.healthpromoter/yp.healthpromoter.campaign.new.html",
                    controller: "CampaignCtrl",
                    access: accessLevels.all
                });
        }])


    .factory('yp.healthpromoter.HealthPromoterService', ['$http', 'Restangular', function ($http, Restangular) {

        var campaigns = Restangular.all('campaigns');


        var myService = {
            campaigns: campaigns.getList()
        };

        return myService;
    }])

    .controller('HealthPromoterCtrl', ['$scope', 'yp.healthpromoter.HealthPromoterService', '$modal', '$log',
        function ($scope, HealthPromoterService, $modal, $log) {

            $scope.healthpromoter =

                $scope.welcomeMsgOpen = function () {

                    var modalInstance = $modal.open({
                        templateUrl: 'yp.healthpromoter/yp.healthpromoter.welcome.html',
                        controller: 'HealthPromoterWelcomeCtrl',
                        backdrop: true
                    });

                    modalInstance.result.then(function (doNotShowAgain) {
                        $log.info('doNotShowAgain(healthPromoterWelcome): ' + doNotShowAgain);
                        if (doNotShowAgain && $scope.principal.isAuthenticated()) {
                            var user = $scope.principal.getUser();
                            user.preferences.dismissedDialogs.push('HealthPromoterWelcome');
                            user.put();
                        }
                    });
                };
            if ((!$scope.principal.isAuthenticated()) || ($scope.principal.getUser().preferences.dismissedDialogs.indexOf('HealthPromoterWelcome') === -1)) {
                $scope.welcomeMsgOpen();
            }

            HealthPromoterService.campaigns.then(function (data) {
                $scope.campaigns = data;
            });


        }]);

