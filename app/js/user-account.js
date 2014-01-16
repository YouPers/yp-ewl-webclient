(function () {
    'use strict';



    angular.module('yp.user', ['restangular'])


        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
            function ($stateProvider, $urlRouterProvider, accessLevels) {
                $stateProvider
                    .state('account', {
                        url: "/account",
                        templateUrl: "partials/user.account.html",
                        controller: "UserAccountCtrl",
                        access: accessLevels.individual,
                        resolve: { }
                    });
            }])


        .controller('UserAccountCtrl', ['$scope', '$rootScope', 'principal', 'authority', 'yp.user.UserService',
            function ($scope, $rootScope, principal, authority, UserService) {
                $scope.principal = principal;


                $scope.accountUserObjReset = function() {
                    $scope.accountUserObj = _.clone(principal.getUser());
                };
                $scope.accountUserObjReset();


                $scope.saveAccount = function() {
                    UserService.putUser($scope.accountUserObj).then(function(user) {
                        authority.authorize(user);
                        $rootScope.$broadcast('globalUserMsg', 'Your account has been saved', 'success', 3000);
                    });

                };

                $scope.passwordUserObjReset = function() {
                    $scope.passwordUserObj = _.clone(principal.getUser());
                };
                $scope.passwordUserObjReset();

                $scope.changePassword = function() {
                    UserService.putUser($scope.passwordUserObj).then(function(user) {

                        UserService.login($scope.passwordUserObj, function() {

                            $scope.passwordUserObjReset();
                            $scope.$broadcast('formPristine');
                            
                            $rootScope.$broadcast('globalUserMsg', 'Your password has been changed', 'success', 3000);
                        });
                    }, function(err) {
                        $rootScope.$broadcast('globalUserMsg', "Current password is invalid", 'danger', 3000);
                    });
                };
            }]);

}());