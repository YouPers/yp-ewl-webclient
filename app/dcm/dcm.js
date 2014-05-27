(function () {
    'use strict';


    angular.module('yp.dcm',
        [
            'ngSanitize',
            'restangular',
            'ui.router',

            'yp.components'
        ])

        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('dcm/dcm');
        }]);

}());