(function () {
    'use strict';

    angular.module('yp.components.util',
        [
            'yp.components.util.directives',
            'yp.components.util.filters',

            'yp.components.util.error',
            'yp.components.util.clientMessage',
            'yp.components.util.base64'
        ])

        .factory("util", ["$q", '$timeout',
            function ($q, $timeout) {

                var util = {

                    loadJSIncludes: function loadJSInclude(scriptPaths) {
                        var promises = [];
                        angular.forEach(scriptPaths, function(path) {
                            promises.push(util.loadJSInclude(path));
                        });
                        return $q.all(promises);
                    },
                    loadJSInclude: function loadJSInclude(scriptPath) {
                        var scriptNode = document.createElement('SCRIPT');
                        scriptNode.type = 'text/javascript';
                        scriptNode.src = scriptPath;

                        var headNode = document.getElementsByTagName('HEAD');

                        if (headNode[0] !== null) {
                            headNode[0].appendChild(scriptNode);
                        }

                        var deferred = $q.defer();

                        var callback = function callback() {
                            $timeout(function () {
                                deferred.resolve(scriptPath);
                            });
                        };

                        if (callback !== null) {
                            scriptNode.onreadystagechange = callback;
                            scriptNode.onload = callback;
                            scriptNode.onerror = function (e) {
                                $timeout(function () {
                                    deferred.reject(e);
                                });
                            };
                        }

                        return deferred.promise;
                    },

                    /**
                     * resolve a nested property of an object by specifying the property names, concatenated by a '.' (dot)
                     * example: obj, 'foo.bar' => obj.foo.bar
                     *
                     *
                     * @param o
                     * @param s
                     * @returns {*}
                     */
                    byString: function byString (o, s) {
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

                };
                return util;
            }]);

})();