(function () {
    'use strict';

    angular.module('yp.config', [])

        // overridden in index.html with environment specific configuration
        .constant('yp.config', {
            "backendUrl": "http://localhost:8000/api/v1"
        });

}());