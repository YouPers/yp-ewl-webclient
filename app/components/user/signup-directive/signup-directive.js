(function () {
    'use strict';

    angular.module('yp.components.user')
        .directive('signUp', ['UserService', '$rootScope', '$state', function (UserService, $rootScope, $state) {
            return {
                restrict: 'E',
                scope: {
                    onSignUp: "&"
                },
                templateUrl: 'components/user/signup-directive/signup-directive.html',
                link: function (scope, elem, attrs) {

                    scope.user = {};

                    scope.submit = function() {

                        var user = scope.newUser;

                        UserService.submitNewUser(user).then(function (newUser) {
                            var keepMeLoggedIn = true;
                            UserService.login(UserService.encodeCredentials(user.username, user.password), keepMeLoggedIn).then(function() {

                                if(attrs.onSignIn) { // can't check isolated scope variable as it is always defined
                                    return scope.onSignUp();
                                }

                                if ($rootScope.nextStateAfterLogin) {
                                    $state.go($rootScope.nextStateAfterLogin.toState, $rootScope.nextStateAfterLogin.toParams);
                                } else {
                                    $state.go('dhc.game', {view: ""});
                                }
                            });
                        });
                    };
                }
            };
        }]);

}());
