(function () {
    'use strict';


    angular.module('yp.user')


        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
            function ($stateProvider, $urlRouterProvider, accessLevels) {
                $stateProvider
                    .state('account', {
                        url: "/account",
                        templateUrl: "yp.user/yp.user.account.html",
                        controller: "UserAccountCtrl",
                        access: accessLevels.user,
                        resolve: { }
                    });
            }])


        .controller('UserAccountCtrl', ['$scope', '$rootScope', 'UserService', '$analytics',
            function ($scope, $rootScope, UserService, $analytics) {

                $analytics.pageTrack('/account');

                $scope.accountUserObjReset = function () {
                    $scope.accountUserObj = _.clone($scope.principal.getUser());
                };

                $scope.accountUserObjReset();

                $scope.saveAccount = function () {
                    UserService.putUser($scope.accountUserObj).then(function (user) {
                        $rootScope.$emit('clientmsg:success', 'account.save');
                    });

                };

                $scope.passwordUserObjReset = function () {
                    $scope.passwordUserObj = _.clone($scope.principal.getUser());
                };
                $scope.passwordUserObjReset();

                $scope.changePassword = function () {
                    UserService.putUser($scope.passwordUserObj).then(function (user) {

                        UserService.logout();
                        UserService.login($scope.passwordUserObj).then(function () {

                            $scope.passwordUserObjReset();
                            $scope.$broadcast('formPristine');

                            $rootScope.$emit('clientmsg:success', 'password.save');
                        });
                    }, function (err) {
                        $rootScope.$emit('clientmsg:error', 'password.invalid');
                    });
                };
            }]);

}());