(function () {
    'use strict';

    angular.module('yp.components.healthCoach', [])

        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('components/health-coach/health-coach');
        }]);

})();