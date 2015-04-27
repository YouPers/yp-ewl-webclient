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

                        scope.$watch(function () {
                            return scope.user.avatar;
                        }, function (avatar) {
                            scope.defaultAvatar = UserService.hasDefaultAvatar(scope.user);
                        });

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
                    user: '&'
                },
                link: function (scope, elem, attrs) {

                    var authenticatedUser = UserService.principal.getUser();

                    if(!scope.user()) {
                        scope.user = authenticatedUser;
                    } else {
                        scope.user = scope.user();
                    }

                    var isAuthenticatedUser = authenticatedUser.id === scope.user.id;

                    scope.$watch(function () {

                        // check authenticated user (omit parameter) for the case of a change due to the upload
                        // TODO:
                        // research if there is a better way to reevaluate the user in the scope attribute,
                        // something like scope: { user: '&' } and scope.$eval

                        return  isAuthenticatedUser && UserService.hasDefaultAvatar(isAuthenticatedUser ? undefined : scope.user);
                    }, function (showAvatarUpload) {
                        scope.showAvatarUpload = showAvatarUpload;
                        if(isAuthenticatedUser) {
                            scope.user = UserService.principal.getUser();
                        }
                    });
                }
            };
        }]);
}());