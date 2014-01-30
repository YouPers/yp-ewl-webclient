(function () {

    'use strict';

    angular.module('yp.user')
        .directive('user', ['UserService', function (UserService) {
            return {
                restrict: 'EA',
                transclude: true,
                templateUrl: 'yp.user/yp.user.directive.user.html',

                link: function (scope, elem, attrs) {

                    if(attrs.user) {
                        scope.user = Object.byString(scope, attrs.user);
                    } else {
                        scope.user = scope.principal.getUser();
                    }

                }
            };
        }]);

}());