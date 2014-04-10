(function () {

    'use strict';

    angular.module('yp.dhc')
        .directive('notifications', ['$rootScope', 'NotificationService',
            function ($rootScope, NotificationService) {
                return {
                    restrict: 'E',
                    scope: {},
                    templateUrl: 'components/notifications/notifications-directive.html',

                    link: function (scope, elem, attrs) {
                        console.log();
                        NotificationService.getNotifications().then(function(result) {
                            scope.notifications = result;
                        });
                    }
                };
            }])
        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('components/notifications/notifications');
        }]);

}());