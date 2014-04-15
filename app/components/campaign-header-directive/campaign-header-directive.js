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

                    function _setCampaign() {
                        var user = UserService.principal.getUser();
                        scope.campaigns = user.campaign ? [user.campaign] : [];
                    }

                    _setCampaign();

                    $rootScope.$on('event:authority-deauthorized', function() {
                        scope.campaigns = [];
                    });

                    $rootScope.$on('event:authority-authorized', function() {
                        _setCampaign();
                    });
                }
            };
        }])
        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('components/campaign-header-directive/campaign-header');
        }]);

}());