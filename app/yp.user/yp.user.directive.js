(function () {

    'use strict';

    angular.module('yp.user')
        .directive('user', ['UserService', function (UserService) {
            return {
                restrict: 'EA',
                transclude: true,
                templateUrl: 'yp.user/yp.user.directive.user.html',

                link: function (scope, elem, attrs) {

                    if(attrs.user) {
                        scope.user = byString(scope, attrs.user);
                    } else {
                        scope.user = scope.principal.getUser();
                    }
                }
            };
        }]);


    // internal functions

    /**
     * resolve a nested property of an object by specifying the property names, concatenated by a '.' (dot)
     * example: obj, 'foo.bar' => obj.foo.bar
     *
     *
     * @param o
     * @param s
     * @returns {*}
     */
    function byString (o, s) {
        s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        s = s.replace(/^\./, '');           // strip a leading dot
        var a = s.split('.');
        while (a.length) {
            var n = a.shift();
            if (n in o) {
                o = o[n];
            } else {
                return;
            }
        }
        return o;
    }


}());