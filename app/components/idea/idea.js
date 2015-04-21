(function () {
    'use strict';

    angular.module('yp.components')

        .controller('IdeaController', ['$scope', '$rootScope', '$state', '$window', 'ActivityService', 'idea',
            function ($scope, $rootScope, $state, $window, ActivityService, idea) {

                $scope.options = {};
                $scope.idea = idea;

                var backToPreviousState = $state.$current.previous.name === 'dcm.activity' ||
                    $state.$current.previous.name === 'dcm.recommendation';

                $scope.onSave = function (idea) {
                    if (backToPreviousState) {
                        $scope.back();
                    } else if ($scope.parentState === 'dcm') {
                        $scope.idea = idea;
                        $scope.options.dropdownOpen = true;
                    } else if ($scope.parentState === 'dhc') {
                        $scope.$state.go('dhc.activity', {idea: idea.id, activity: '', socialInteraction: ''});
                    }
                };
                $scope.back = function () {
                    if (backToPreviousState) {
                        $window.history.back();
                    } else {
                        $state.go('homedispatcher');
                    }
                };

            }
        ])

        .controller('IdeasController', ['$scope', '$rootScope', 'ideas', 'campaign',
            function ($scope, $rootScope, ideas, campaign) {
                var ideasController = this;
                $scope.campaign = campaign;
                $scope.ideas = ideas;



                $scope.toggleListItem = function ($index) {
                    ideasController.expanedListItem = ideasController.expanedListItem === $index ? undefined : $index;
                };
            }
        ])


        .filter('fulltext', function () {
            return function (ideas, query) {
                if (!query || query.length < 3) {
                    return ideas;
                }
                return _.filter(ideas, function (idea) {
                    return (!query || (idea.title.toUpperCase() + idea.number.toUpperCase()).indexOf(query.toUpperCase()) !== -1);
                });

            };
        })
        .run(['$rootScope', function ($rootScope) {
            _.merge($rootScope.enums, {
                executiontype: [
                    'self',
                    'group'
                ],
                activityPlanFrequency: [
                    'once',
                    'day',
                    'week',
                    'month'
                ],
                visibility: [
                    'public',
                    'campaign',
                    'private'
                ],
                source: [
                    'youpers',
                    'community',
                    'campaign'
                ],
                calendarNotifications: [
                    'none',
                    '0',
                    '300',
                    '600',
                    '900',
                    '1800',
                    '3600',
                    '7200',
                    '86400',
                    '172800'
                ]
            });
        }]);
}());