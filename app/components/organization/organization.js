(function () {
    'use strict';

    angular.module('yp.components.organization', ['yp.components.user'])


        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('components/organization/organization');
        }]);

})();