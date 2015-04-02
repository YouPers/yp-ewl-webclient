(function () {
    'use strict';


    angular.module('yp.admin')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider

                    .state('admin.users', {
                        url: "/users",
                        access: accessLevels.systemadmin,
                        views: {
                            content: {
                                templateUrl: "admin/user/users.html",
                                controller: 'AdminUsersCtrl'
                            }
                        },
                        resolve: { }
                    });

                $translateWtiPartialLoaderProvider.addPart('admin/user/user');

            }])

        .controller('AdminUsersCtrl', ['$scope', '$rootScope', '$filter', 'UserService',
            function ($scope, $rootScope, $filter, UserService) {


                $scope.getUsers = function(val) {
                    return UserService.getUsers({ 'filter[fullname]': val }).then(function(users){

                        return users;
                    });
                };

                $scope.onUserSelected = function onUserSelected($item, $model, $label) {
                    $scope.selectedUser = $item;
                };

                $scope.changePassword = function changePassword() {
                    UserService.putUser($scope.selectedUser).then(function (user) {

                        $scope.selectedUser = user;
                        $scope.$broadcast('formPristine');
                        $rootScope.$emit('clientmsg:success', 'password.save');
                    });
                };


        }]);


}());