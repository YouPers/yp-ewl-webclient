(function () {
    'use strict';


    angular.module('yp.components.user')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
            function ($stateProvider, $urlRouterProvider, accessLevels) {
                $stateProvider
                    .state('account', {
                        url: "/account",
                        templateUrl: "components/user/account/account.html",
                        controller: "UserAccountCtrl",
                        access: accessLevels.user,
                        resolve: { }
                    });
            }])


        .controller('UserAccountCtrl', ['$scope', '$rootScope', '$state', 'UserService',
            function ($scope, $rootScope, $state, UserService) {

                $scope.reset = function () {
                    $state.reload();
                };

                $scope.accountUserObj = _.clone($scope.principal.getUser());

                $scope.saveAccount = function () {

                    // TODO: remove this, once we removed the merge of the current user in authenticate
                    $scope.principal.getUser().fullname = $scope.accountUserObj.fullname =
                        $scope.accountUserObj.firstname + ' ' + $scope.accountUserObj.lastname;

                    UserService.putUser($scope.accountUserObj).then(function (user) {
                        $rootScope.$emit('clientmsg:success', 'account.save');
                        $state.reload();
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