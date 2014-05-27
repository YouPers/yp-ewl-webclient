(function () {
    'use strict';

    angular.module('yp.components.util',
        [
            'yp.components.util.directives',
            'yp.components.util.filters',

            'yp.components.util.error',
            'yp.components.util.clientMessage',
            'yp.components.util.base64'
        ]);

})();