(function () {
    'use strict';

    angular.module('yp.dhc.plan',
        [
            'restangular',
            'ui.router'
        ])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('plan', {
                        templateUrl: "layout/default.html",
                        access: accessLevels.all
                    })
                    .state('plan.offer', {
                        url: "/plan",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dhc/plan/plan.html',
                                controller: 'PlanController'
                            }
                        },
                        resolve: {
                            plans: ['$stateParams', 'ActivityService', function ($stateParams, ActivityService) {
                                return ActivityService.getActivityPlans({'populate': ['owner', 'invitedBy', 'joiningUsers', 'activity']});
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/plan/plan');
            }])

        .controller('PlanController', [ '$scope', '$rootScope', '$state', '$timeout', 'plans', 'ActivityService',
            function ($scope, $rootScope, $state, $timeout, plans, ActivityService) {

                var events = [];

                _.forEach(plans, function(plan) {
                    _.forEach(plan.events, function(event) {
                        event.plan = plan;
                        events.push(event);
                    });
                });

                var groupedEvents = _.groupBy(events, function(event) {

                    var date = event.begin;

                    // open events that have past
                    if(event.status === 'open' && moment().diff(date) > 0) {
                        return 'open';
                    }

                    var diff = Math.abs(moment().diff(date, 'days'));

                    // TODO: finetune today/tomorrow

                    if(diff < 1) {
                        return 'today';
                    } else if(diff < 2) {
                        return 'tomorrow';
                    } else if(diff < 7) {
                        return 'week';
                    } else if(diff < 31) {
                        return 'month';
                    } else {
                        return 'other';
                    }

                });

                var groups = [
                    'open',
                    'today',
                    'tomorrow',
                    'week',
                    'month',
                    'other'
                ];

                if(groupedEvents.open) {

                }

                $scope.groups = [];
                _.forEach(groups, function (group) {
                    if(groupedEvents[group]) {

                        var events = _.sortBy(groupedEvents[group], function(event) {
                            return event.begin;
                        });

                        if(group === 'open') {
                            $scope.openEvents = events.length;
                            events = _.first(events, 2);
                        }

                        $scope.groups.push({
                            name: group,
                            events: events
                        });
                    }
                });

                $scope.getJoiningUsers = function (event) {
                    return _.pluck(event.plan.joiningUsers.slice(1), 'fullname').join('<br/>');
                };
            }
        ]);

}());