(function () {
    'use strict';

    angular.module('yp.components.avatarUpload', [])


        /**
         * directive: avatar-upload
         *
         * dependencies: avatarObject in parent scope, with the avatar at avatarObject.avatar
         *               or a custom object specified as attribute
         *
         * default: user avatar for the authenticated user
         *
         * optional attributes:
         *
         *  - type: [ 'organization' ]
         *  - avatarObject: the object where the avatar is located, avatarObject.avatar
         *
         */
        .directive('avatarUpload', ['$rootScope', '$http', 'FileUploader', 'yp.config','UserService',
            function ($rootScope, $http, FileUploader, config, UserService) {
                return {
                    restrict: 'E',
                    transclude: true,
                    templateUrl: 'components/directives/avatar-upload-directive/avatar-upload-directive.html',
                    scope: {
                        avatarObject: "="
                    },
                    priority: 10,
                    link: function (scope, elem, attrs) {

                        var uploader;

                        if(!scope.avatarObject && (!attrs.avatarObject || !scope[attrs.avatarObject])) {
                            throw "avatar-upload: avatarObject not found or specified";
                        } else {

                            var avatarObject = scope.avatarObject;

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

                            uploader = scope.uploader = new FileUploader({
                                scope: scope,
                                url: url,
                                autoUpload: true,
                                headers: {
                                    'Authorization': $http.defaults.headers.common.Authorization
                                }
                            });


                            // images only filter
                            uploader.filters.push({name: 'allowedPicFormats', fn: function(item /*{File|HTMLInputElement}*/) {
                                var type = uploader.isHTML5 ? item.type : '/' + item.value.slice(item.value.lastIndexOf('.') + 1);
                                type = '|' + type.toLowerCase().slice(type.lastIndexOf('/') + 1) + '|';
                                var valid = '|jpg|png|jpeg|bmp|gif|tif|tiff'.indexOf(type) !== -1;
                                if (!valid) {
                                    scope.$apply(function () {
                                        $rootScope.$emit('clientmsg:error', 'avatar.invalid');

                                    });
                                }
                                return  valid;
                            }
                            });


                            // on file upload complete
                            uploader.onErrorItem = function errorCb (item, response, status, headers) {
                                scope.$apply(function() {
                                    $rootScope.$emit('clientmsg:error', 'avatar.error');

                                });
                            };


                            // on file upload complete
                            uploader.onSuccessItem = function successCb (item, response, status, headers) {
                                console.log('success cb called');
                                if(avatarObject) {
                                    UserService.principal.getUser().avatar = avatarObject.avatar = response.avatar;
                                    scope.$apply();
                                }
                                if(attrs.type && attrs.type === 'organization') {
                                    //  nothing to update, because we do not keep an Org in session
                                } else if(attrs.type && attrs.type === 'campaign') {
                                    throw new Error('TODO: need to update the CampaignService.currentCampaign');
                                } else {
                                    UserService.reload();
                                }
                            };

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