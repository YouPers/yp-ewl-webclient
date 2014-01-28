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
                        access: accessLevels.individual,
                        resolve: { }
                    });
            }])


        .controller('UserAccountCtrl', ['$scope', '$rootScope', 'authority', 'UserService',
            function ($scope, $rootScope,  authority, UserService) {

                $scope.accountUserObjReset = function () {
                    $scope.accountUserObj = _.clone($scope.principal.getUser());
                };

                $scope.accountUserObjReset();

                $scope.saveAccount = function () {
                    UserService.putUser($scope.accountUserObj).then(function (user) {
                        authority.authorize(user);
                        $rootScope.$broadcast('globalUserMsg', 'Your account has been saved', 'success', 3000);
                    });

                };

                $scope.passwordUserObjReset = function () {
                    $scope.passwordUserObj = _.clone($scope.principal.getUser());
                };
                $scope.passwordUserObjReset();

                $scope.changePassword = function () {
                    UserService.putUser($scope.passwordUserObj).then(function (user) {

                        UserService.login($scope.passwordUserObj, function () {

                            $scope.passwordUserObjReset();
                            $scope.$broadcast('formPristine');

                            $rootScope.$broadcast('globalUserMsg', 'Your password has been changed', 'success', 3000);
                        });
                    }, function (err) {
                        $rootScope.$broadcast('globalUserMsg', "Current password is invalid", 'danger', 3000);
                    });
                };
            }]);

}());