(function () {

    'use strict';

    angular.module('yp.components.socialInteraction')
        .directive('socialInteraction', ['$rootScope', '$state','accessLevels', 'SocialInteractionService',
            function ($rootScope, $state, accessLevels, SocialInteractionService) {
                return {
                    restrict: 'E',
                    scope: {},
                    templateUrl: 'components/social-interaction/social-interaction-directive.html',

                    link: function (scope, elem, attrs) {

                        SocialInteractionService.getSocialInteractions({ populate: 'author' }).then(function (socialInteractions) {
                            scope.socialInteractions = socialInteractions;
                        });

                        scope.dismissSocialInteraction = function dismissSocialInteraction(socialInteraction) {
                            SocialInteractionService.deleteSocialInteraction(socialInteraction.id);
                            _.remove(scope.socialInteractions, { id: socialInteraction.id });
                        };

                    }
                };
            }]);

}());