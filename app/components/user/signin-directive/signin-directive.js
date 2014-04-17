(function () {
    'use strict';

    angular.module('yp.dhc')
        .directive('signIn', ['UserService', '$state', function (UserService, $state) {
            return {
                restrict: 'E',
                scope: {
                    onSignIn: "&"
                },
                templateUrl: 'components/user/signin-directive/signin-directive.html',
                link: function (scope, elem, attrs) {


                    scope.keepMeLoggedIn = true;

                    scope.submit = function () {
                        UserService.login(UserService.encodeCredentials(scope.username, scope.password),  scope.keepMeLoggedIn)
                            .then(function (response) {

                                scope.username = '';
                                scope.password = '';

                                if(scope.onSignIn) {
                                    return scope.onSignIn();
                                }

                                if (scope.nextStateAfterLogin) {
                                    scope.$state.go(scope.nextStateAfterLogin.toState, scope.nextStateAfterLogin.toParams);
                                } else {
                                    $state.go('home.content');
                                }

                            }
                        );

                    };
                }
            };
        }]);

}());
