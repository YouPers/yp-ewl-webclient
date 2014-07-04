(function () {
    'use strict';

    angular.module('yp.components.socialInteraction', ['yp.components.user'])

        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('components/social-interaction/social-interaction');
        }]);

})();