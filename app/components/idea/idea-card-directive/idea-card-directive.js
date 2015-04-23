(function () {

    'use strict';

    angular.module('yp.components.ideaCard', [])
        .directive('ideaCard', ['$rootScope', '$sce', '$window', '$state', 'UserService', function ($rootScope, $sce, $window, $state, UserService) {
            return {
                restrict: 'EA',
                scope: {
                    idea: '=',
                    activity: '=',
                    socialInteraction: '='
                },
                templateUrl: 'components/idea/idea-card-directive/idea-card-directive.html',

                link: function (scope, elem, attrs) {


                    if(!attrs.idea) {
                        throw new Error("ideaCard: attribute 'idea' is required");
                    }

                    // show edit link:
                    // - if we are not currently on one of the edit states
                    // - the user is the author of the idea
                    scope.showEditLink =
                        $state.current.name !== 'dhc.idea' &&
                        $state.current.name !== 'dcm.idea' &&
                        $state.current.name !== 'admin.idea-edit' &&
                        (scope.idea.author || scope.idea.author.id) === UserService.principal.getUser().id;

                    scope.flip = function() {
                        var flipped = scope.flipped;
                        $rootScope.$broadcast('flipped');
                        scope.flipped = !flipped;
                    };

                    $rootScope.$on('flipped', function() {
                        scope.flipped = false;
                    });


                    scope.getRenderedText = function (text) {
                        if (text) {
                            return $sce.trustAsHtml(marked(text));
                        } else {
                            return "";
                        }
                    };
                }
            };
        }]);

}());