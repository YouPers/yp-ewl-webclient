(function () {
    'use strict';

    angular.module('yp.commons')


        /**
         * directive: avatar-upload
         *
         * dependencies: avatarObject in parent scope, with the avatar at avatarObject.avatar
         *               or a custum object specified as attribute
         *
         * default: user avatar for the authenticated user
         *
         * optional attributes:
         *
         *  - type: [ 'organization' ]
         *  - avatarObject: the object where the avatar is located, avatarObject.avatar
         *
         */
        .directive('avatarUpload', ['$rootScope', '$http', '$fileUploader', 'yp.config',
            function ($rootScope, $http, $fileUploader, config) {
                return {
                    restrict: 'E',
                    transclude: true,
                    templateUrl: 'yp.commons/yp.directive.avatar.upload.html',
                    link: function (scope, elem, attrs) {

                        var uploader;

                        if(!scope.avatarObject && (!attrs.avatarObject || !scope[attrs.avatarObject])) {
                            throw "avatar-upload: avatarObject not found or specified";
                        } else {
                            var avatarObject = scope.avatarObject ? 'avatarObject' : attrs.avatarObject;
                            scope.$watch(avatarObject, function(avatarObject) {

                                if(!avatarObject || _.isEmpty(avatarObject)) {
                                    return;
                                }

                                scope.avatarObject = avatarObject;

                                var url;

                                if(attrs.type && attrs.type === 'organization') {
                                    url = config.backendUrl + "/organizations/" + scope.avatarObject.id + "/avatar";
                                } else if(attrs.type && attrs.type === 'campaign') {
                                    url = config.backendUrl + "/campaigns/" + scope.avatarObject.id + "/avatar";
                                } else {
                                    url = config.backendUrl + "/users/" + scope.avatarObject.id + "/avatar";
                                }

                                uploader = scope.uploader = $fileUploader.create({
                                    scope: scope,
                                    url: url,
                                    autoUpload: true,
                                    headers: {
                                        'Authorization': $http.defaults.headers.common.Authorization
                                    }
                                });


                                // images only filter
                                uploader.filters.push(function(item /*{File|HTMLInputElement}*/) {
                                    var type = uploader.isHTML5 ? item.type : '/' + item.value.slice(item.value.lastIndexOf('.') + 1);
                                    type = '|' + type.toLowerCase().slice(type.lastIndexOf('/') + 1) + '|';
                                    var valid = '|jpg|png|jpeg|bmp|gif|tif|tiff'.indexOf(type) !== -1;
                                    if(!valid) {
                                        scope.$apply(function() {
                                            $rootScope.$emit('clientmsg:error', 'avatar.invalid');

                                        });
                                    }
                                    return  valid;
                                });


                                // on file upload complete
                                uploader.bind('error', function (event, xhr, item, response) {
                                    scope.$apply(function() {
                                        $rootScope.$emit('clientmsg:error', 'avatar.error');

                                    });
                                });
                                // on file upload complete
                                uploader.bind('success', function (event, xhr, item, response) {
                                    if(scope.avatarObject) {
                                        scope.avatarObject.avatar = response.avatar;
                                    }
                                });
                            });
                        }
                    }
                };
        }])


        .directive('avatar', function() {
            return function(scope, element, attrs) {

                scope.$watch('avatarObject.avatar', function(avatar) {
                    if(avatar) {
                        element.css("background-image", "url(" + avatar + ")");
                    }
                });
            };
        });
}());