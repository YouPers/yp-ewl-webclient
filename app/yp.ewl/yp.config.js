(function () {
    'use strict';

    angular.module('yp.config', [])
        .constant('yp.config', {
            "backendUrl": "http://localhost:8000/api/v1"
        });

}());