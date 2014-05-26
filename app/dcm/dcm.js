(function () {
    'use strict';


    angular.module('yp.dcm',
        [
            'ngSanitize',
            'restangular',
            'ui.router',

            'yp.user',
            'yp.components',
            'yp.components.campaign',
            'yp.components.notifications'
        ])

        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('dcm/dcm');
        }]);

}());