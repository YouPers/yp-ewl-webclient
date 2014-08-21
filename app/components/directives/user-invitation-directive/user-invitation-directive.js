(function () {

    'use strict';

    angular.module('yp.components.userInvitation', [])

        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('components/directives/user-invitation-directive/user-invitation-directive');
        }])

        .directive('userInvitation', ['UserService', function (UserService) {
            return {
                restrict: 'EA',
                scope: {
                    type: '@',
                    refDoc: '=',
                    onUserSelected: '='
                },
                templateUrl: 'components/directives/user-invitation-directive/user-invitation-directive.html',

                link: function (scope, elem, attrs) {

                    scope.selectUser = function($item, $model, $label) {
                        scope.onUserSelected($item);
                    };

                    scope.getUsers = function(val) {
                        return UserService.getUsers({ 'filter[fullname]': val }).then(function(users){
                            return users;
                        });
                    };

                }
            };
        }]);

}());