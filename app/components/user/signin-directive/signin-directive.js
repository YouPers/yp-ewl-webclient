(function () {
    'use strict';

    angular.module('yp.components.user')
        .directive('signIn', ['UserService', '$rootScope', '$state', function (UserService, $rootScope, $state) {
            return {
                restrict: 'E',
                scope: {
                    onSignIn: "&?"
                },
                templateUrl: 'components/user/signin-directive/signin-directive.html',
                link: function (scope, elem, attrs) {


                    scope.keepMeLoggedIn = true;

                    scope.submit = function () {
                        UserService.login(UserService.encodeCredentials(scope.username, scope.password),  scope.keepMeLoggedIn)
                            .then(function (response) {

                                scope.username = '';
                                scope.password = '';

                                if(attrs.onSignIn) { // can't check isolated scope variable as it is always defined
                                    return scope.onSignIn();
                                }

                                $rootScope.$broadcast('language:changed', response.profile.language);

                                if ($rootScope.nextStateAfterLogin) {
                                    $state.go($rootScope.nextStateAfterLogin.toState, $rootScope.nextStateAfterLogin.toParams);
                                } else {
                                    $state.go('homedispatcher');
                                }

                            }
                        );

                    };
                }
            };
        }]);

}());
