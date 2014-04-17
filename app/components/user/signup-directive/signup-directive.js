(function () {
    'use strict';

    angular.module('yp.dhc')
        .directive('signUp', ['UserService', '$state', function (UserService, $state) {
            return {
                restrict: 'E',
                scope: {
                    onSignUp: "&"
                },
                templateUrl: 'components/user/signup-directive/signup-directive.html',
                link: function (scope, elem, attrs) {

                    scope.user = {};

                    scope.$watchCollection('[user.firstname, user.lastname]', function () {
                        if (scope.registerform && !scope.registerForm.username.$dirty && scope.user.firstname) {
                            scope.result.newuser.username = (scope.result.newuser.firstname.substr(0, 1) || '').toLowerCase() + (scope.result.newuser.lastname || '').toLowerCase();
                        }
                    });

                    scope.submit = function() {

                        var user = scope.newUser;

                        UserService.submitNewUser(user).then(function (newUser) {
                            UserService.login(UserService.encodeCredentials(user.username, user.password)).then(function() {


                                if(scope.onSignUp) {
                                    return scope.onSignUp();
                                }

                                if (scope.nextStateAfterLogin) {
                                    scope.$state.go(scope.nextStateAfterLogin.toState, scope.nextStateAfterLogin.toParams);
                                } else {
                                    $state.go('home.content');
                                }
                            });
                        });
                    };
                }
            };
        }]);

}());
