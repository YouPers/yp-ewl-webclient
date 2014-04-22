(function () {

    'use strict';

    angular.module('yp.dhc')
        .directive('campaignHeader', ['$rootScope', '$state','UserService',
            function ($rootScope,  $state, UserService) {
            return {
                restrict: 'E',
                scope: {
                    campaign: '=campaign'
                },
                templateUrl: 'components/campaign-header-directive/campaign-header-directive.html',

                link: function (scope, elem, attrs) {


                    function _setCampaignFromUser() {
                        var user = UserService.principal.getUser();
                        scope.campaigns = user.campaign ? [user.campaign] : [];
                    }


                    if (attrs.campaign) {
                        scope.campaigns = [attrs.campaign];
                    } else {
                        _setCampaignFromUser();
                    }

                    $rootScope.$on('event:authority-deauthorized', function() {
                        scope.campaigns = [];
                    });

                    $rootScope.$on('event:authority-authorized', function() {
                        _setCampaignFromUser();
                    });
                }
            };
        }])
        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('components/campaign-header-directive/campaign-header');
        }]);

}());