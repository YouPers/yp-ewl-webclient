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

                    //scope.termsAccepted = false;

                    scope.submit = function() {

                        scope.$root.$broadcast('busy.begin', {url: "users", name: "signup"});

                        scope.termsAccepted = true;

                        var user = scope.newUser;

                        UserService.submitNewUser(user).then(function (newUser) {
                            var keepMeLoggedIn = true;
                            UserService.login(UserService.encodeCredentials(user.username, user.password), keepMeLoggedIn).then(function() {

                                scope.$root.$broadcast('busy.end', {url: "users", name: "signup"});

                                if(attrs.onSignUp) { // can't check isolated scope variable as it is always defined
                                    return scope.onSignUp();
                                }

                                if ($rootScope.nextStateAfterLogin) {
                                    $state.go($rootScope.nextStateAfterLogin.toState, $rootScope.nextStateAfterLogin.toParams);
                                } else {
                                    $state.go('homedispatcher');
                                }
                            });
                        });
                    };
                }
            };
        }]);

}());
