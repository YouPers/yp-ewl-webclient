/*!
 * angular-translate - v2.4.2 - 2014-10-21
 * http://github.com/angular-translate/angular-translate
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