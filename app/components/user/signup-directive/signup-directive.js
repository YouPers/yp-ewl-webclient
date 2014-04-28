(function () {
    'use strict';

    angular.module('yp.dhc')
        .directive('signUp', ['UserService', '$rootScope', '$state', function (UserService, $rootScope, $state) {
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
                            scope.user.username = (scope.user.firstname.substr(0, 1) || '').toLowerCase() + (scope.user.lastname || '').toLowerCase();
                        }
                    });

                    scope.submit = function() {

                        var user = scope.newUser;

                        UserService.submitNewUser(user).then(function (newUser) {
                            UserService.login(UserService.encodeCredentials(user.username, user.password)).then(function() {


                                if(attrs.onSignIn) { // can't check isolated scope variable as it is always defined
                                    return scope.onSignUp();
                                }

                                if ($rootScope.nextStateAfterLogin) {
                                    $state.go($rootScope.nextStateAfterLogin.toState, $rootScope.nextStateAfterLogin.toParams);
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
