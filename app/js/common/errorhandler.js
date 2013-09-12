"use strict";


angular.module('globalErrors', [])
    .config(function($provide, $httpProvider, $compileProvider, $rootScope) {
        var elementsList = $();

        var showMessage = function (errText, type, duration) {
            $rootScope.$broadcast('globalUserMsg', errText, type, duration);
        }

        $httpProvider.responseInterceptors.push(function($timeout, $q) {
            return function(promise) {
                return promise.then(function(successResponse) {
                    if (successResponse.config.method.toUpperCase() != 'GET')
                        showMessage('Success', 'successMessage', 5000);
                    return successResponse;

                }, function(errorResponse) {
                    switch (errorResponse.status) {
                        case 401:
                            showMessage('Wrong username or password', 'error', 5000);
                            break;
                        case 403:
                            showMessage('You don\'t have the right to do this', 'error', 5000);
                            break;
                        case 500:
                            showMessage('Server internal error: ' + errorResponse.data, 'error', 5000);
                            break;
                        default:
                            showMessage('Error ' + errorResponse.status + ': ' + errorResponse.data, 'error', 5000);
                    }
                    return $q.reject(errorResponse);
                });
            };
        });
    });
