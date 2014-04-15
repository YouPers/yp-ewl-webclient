(function () {

    'use strict';

    angular.module('yp.dhc')
        .directive('campaignHeader', ['$rootScope', '$state','UserService',
            function ($rootScope,  $state, UserService) {
            return {
                restrict: 'E',
                scope: {},
                templateUrl: 'components/campaign-header-directive/campaign-header-directive.html',

                link: function (scope, elem, attrs) {
                    var user = UserService.principal.getUser();
                    scope.campaigns = user.campaign ? [user.campaign] : [];
                }
            };
        }])
        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('components/campaign-header-directive/campaign-header');
        }]);

}());