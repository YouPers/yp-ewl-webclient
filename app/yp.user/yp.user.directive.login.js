(function () {
    'use strict';

    angular.module('yp.user')
        .directive('login', ['UserService', function (UserService) {
            return {
                restrict: 'E',
                templateUrl: 'yp.user/yp.user.directive.login.html',
                link: function (scope, elem, attrs) {


                    scope.loginSubmit = function () {
                        UserService.login(UserService.encodeCredentials(scope.username, scope.password),  scope.keepMeLoggedIn)
                            .then(function () {
                                scope.username = '';
                                scope.password = '';
                            }
                        );

                    };

                }
            };
        }]);

}());
