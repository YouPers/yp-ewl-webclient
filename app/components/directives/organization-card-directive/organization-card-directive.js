(function () {

    'use strict';

    angular.module('yp.components.organizationCard', [])
        .directive('organizationCard', [ 'UserService',
            function (UserService) {
            return {
                restrict: 'E',
                scope: {
                    organization: '='
                },
                transclude: true,
                templateUrl: 'components/directives/organization-card-directive/organization-card-directive.html',

                link: function (scope, elem, attrs) {
                    scope.isOrganizationAdmin = _.contains(UserService.principal.getUser().roles, 'orgadmin');
                }
            };
        }]);
}());