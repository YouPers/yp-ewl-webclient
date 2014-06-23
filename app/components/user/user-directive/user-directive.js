(function () {

    'use strict';

    angular.module('yp.components.user')
        .directive('user', ['UserService', function (UserService) {
            return {
                restrict: 'EA',
                transclude: true,
                templateUrl: 'components/user/user-directive/user-directive.html',
                scope: {
                    user: "="
                },

                link: function (scope, elem, attrs) {

                    if(!attrs.user) {
                        scope.user = scope.principal.getUser();
                    }
                }
            };
        }]);

}());