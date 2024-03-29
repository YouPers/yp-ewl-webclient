(function () {
    'use strict';

    angular.module('yp.components.util')
        .factory('ImageService', ['FileUploader', 'yp.config', '$http', function (FileUploader, config, $http) {

            function getImageUploader(type, scope, successCb) {
                var uploader = new FileUploader({
                    scope: scope,
                    url: config.backendUrl + '/images?type=' + type,
                    autoUpload: true,
                    headers: {
                        'Authorization': $http.defaults.headers.common.Authorization
                    }
                });

                // images only filter
                uploader.filters = uploader.filters.concat([
                    {
                        name: 'fileFormat',
                        fn: function (item /*{File|HTMLInputElement}*/) {
                            var type = uploader.isHTML5 ? item.type : '/' + item.value.slice(item.value.lastIndexOf('.') + 1);
                            type = '|' + type.toLowerCase().slice(type.lastIndexOf('/') + 1) + '|';
                            var valid = '|jpg|png|jpeg|bmp|gif|tif|tiff'.indexOf(type) !== -1;
                            if (!valid) {
                                scope.$apply(function () {
                                    scope.$root.$emit('clientmsg:error', 'avatar.invalid.fileFormat');

                                });
                            }
                            return valid;
                        }
                    },
                    {
                        name: 'fileSize',
                        fn: function (item) {
                            // stay valid if either the size or the limit is not defined
                            var valid = !item.size || !config.avatarFileSizeLimit || item.size < config.avatarFileSizeLimit;
                            if(!valid) {
                                scope.$apply(function () {
                                    scope.$root.$emit('clientmsg:error', 'avatar.invalid.fileSize');
                                });
                            }
                            return valid;
                        }
                    }
                ]);

                // on file upload complete
                uploader.onErrorItem = function errorCb(item, response, status, headers) {
                    scope.$apply(function () {
                        scope.$root.$emit('clientmsg:error', 'avatar.error');

                    });
                };

                // on file upload complete
                uploader.onSuccessItem = function (item, response, status, headers) {
                    return successCb(headers.location);
                };
                return uploader;
            }


            return {
                getImageUploader: getImageUploader
            };
        }]);


})();