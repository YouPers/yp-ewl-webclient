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
        .directive('avatarUpload', ['UserService', 'ImageService',
            function (UserService, ImageService) {
                return {
                    restrict: 'E',
                    transclude: true,
                    templateUrl: 'components/directives/avatar-upload-directive/avatar-upload-directive.html',
                    scope: {
                        avatarObject: "="
                    },
                    priority: 10,
                    link: function (scope, elem, attrs) {

                        if (!scope.avatarObject && (!attrs.avatarObject || !scope[attrs.avatarObject])) {
                            throw "avatar-upload: avatarObject not found or specified";
                        } else {

                            var avatarObject = scope.avatarObject;

                            if (!avatarObject || _.isEmpty(avatarObject)) {
                                return;
                            }

                            scope.avatarObject = avatarObject;

                            scope.uploader = ImageService.getImageUploader(attrs.type || 'user', scope,
                                function successCb(url) {
                                    var user = UserService.principal.getUser();
                                    user.avatar = url;
                                    UserService.putUser(user).then(function(savedUser) {
                                        scope.avatarObject = savedUser;
                                        scope.$root.$emit('clientmsg:success','pictureSaved');
                                    });
                                });
                        }
                    }
                };
            }])


        .directive('avatar', function () {
            return function (scope, element, attrs) {

                scope.$watch('avatarObject.avatar', function (avatar) {
                    if (avatar) {
                        element.css("background-image", "url(" + avatar + ")");
                    }
                });
            };
        });
}());