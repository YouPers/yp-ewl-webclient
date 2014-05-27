(function () {
    'use strict';

    angular.module('yp.components.notifications', ['yp.components.user'])

        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('components/notifications/notifications');
        }]);

})();