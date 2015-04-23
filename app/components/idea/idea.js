(function () {
    'use strict';

    angular.module('yp.components')

        .config(['$translateWtiPartialLoaderProvider', function ($translateWtiPartialLoaderProvider) {
            $translateWtiPartialLoaderProvider.addPart('components/idea/idea');
        }])

        .controller('IdeaController', ['$scope', '$rootScope', '$state', '$window', 'ActivityService', 'topics', 'idea', 'campaign',
            function ($scope, $rootScope, $state, $window, ActivityService, topics, idea, campaign) {

                topics.byId = _.indexBy(topics, 'id');
                $scope.topics = topics;

                // if it has an id, it comes from the backend, so we use the Restangular clone method,
                // otherwise use lodash
                var ideaClone = idea.id ? idea.clone() : _.clone(idea);

                $scope.options = {};
                $scope.idea = idea;

                $scope.save = function () {
                    if ($scope.idea.noDefaultStartTime) {
                        $scope.idea.defaultStartTime = "";
                    } else {
                        // noDefaultStartTime is not selected, check whether a real date is in idea.defaultStartTime,
                        // if not: set to current date
                        // -> prevents the empty idea.defaultStartTime, when the
                        // timepicker is not manually touched by the user
                        if (!$scope.idea.defaultStartTime) {
                            $scope.idea.defaultStartTime = new Date();
                        }
                    }

                    ActivityService.saveIdea($scope.idea).then(function (result) {
                        // reinitialize the UI flag for noDefaultStartTime
                        result.noDefaultStartTime = !idea.defaultStartTime;
                        $scope.idea = result;
                        $scope.idea.uiRecWeights = $scope.idea.getRecWeightsByQuestionId();
                        $scope.ideaForm.$setPristine();
                    });
                };

                $scope.cancel = function () {
                    $scope.idea = ideaClone.id ? ideaClone.clone() : _.clone(ideaClone);
                    $scope.idea.uiRecWeights = $scope.idea.getRecWeightsByQuestionId();
                    $scope.ideaForm.$setPristine();
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