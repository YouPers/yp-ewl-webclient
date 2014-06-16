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

        .factory("util", ["$q",
            function ($q) {

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

                        if (headNode[0] != null) {
                            headNode[0].appendChild(scriptNode);
                        }

                        var deferred = $q.defer();

                        var callback = function callback() {
                            deferred.resolve(scriptPath);
                        };

                        if (callback != null)
                        {
                            scriptNode.onreadystagechange = callback;
                            scriptNode.onload = callback;
                        }
                    }

                };
                return util;
            }]);

})();