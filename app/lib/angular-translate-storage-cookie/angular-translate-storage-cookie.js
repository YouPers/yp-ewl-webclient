/*!
 * angular-translate - v2.1.0 - 2014-04-02
 * http://github.com/PascalPrecht/angular-translate
 * Copyright (c) 2014 ; Licensed MIT
 */
angular.module('pascalprecht.translate').factory('$translateCookieStorage', [
    'ipCookie',
    function (ipCookie) {
        var $translateCookieStorage = {
            get: function (name) {
                return ipCookie(name);
            },
            set: function (name, value) {
                ipCookie(name, value);
            }
        };
        return $translateCookieStorage;
    }
]);
