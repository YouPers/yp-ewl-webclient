(function () {
    'use strict';

    angular.module('yp.components.avatarUpload', [])


        .config(['$translateWtiPartialLoaderProvider', function($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('components/directives/avatar-upload-directive/avatar-upload-directive');
        }])

    /**
     * directive: avatar-upload
     *
     * user avatar upload directive for the authenticated user
     *
     */
        .directive('avatarUpload', ['UserService', 'ImageService',
            function (UserService, ImageService) {
                return {
                    restrict: 'E',
                    transclude: true,
                    templateUrl: 'components/directives/avatar-upload-directive/avatar-upload-directive.html',
                    scope: { },
                    priority: 10,
                    link: function (scope, elem, attrs) {

                        scope.user = UserService.principal.getUser();
                        scope.uploader = ImageService.getImageUploader(attrs.type || 'user', scope,
                            function successCb(url) {
                                var user = UserService.principal.getUser();
                                user.avatar = url;
                                UserService.putUser(user).then(function(savedUser) {
                                    scope.user = savedUser;
                                    scope.$root.$emit('clientmsg:success','pictureSaved');
                                });
                            });
                    }
                };
            }])


        .directive('avatar', ['UserService', function (UserService) {
            return {
                restrict: 'E',
                template: '<img ng-if="!showAvatarUpload" class="avatar" ng-src="{{user.avatar}}"><avatar-upload ng-if="showAvatarUpload"></avatar-upload>',
                scope: {
                    user: '='
                },
                link: function (scope, elem, attrs) {

                    var authenticatedUser = UserService.principal.getUser();

                    if(!scope.user) {
                        scope.user = authenticatedUser;

                    }
                    if(UserService.hasDefaultAvatar(scope.user)) {
                        scope.showAvatarUpload = true;
                    }

                }
            };
        }]);
}());