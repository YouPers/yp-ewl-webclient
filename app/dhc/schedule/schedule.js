(function () {
    'use strict';

    angular.module('yp.dhc.schedule',
        [
            'restangular',
            'ui.router'
        ])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('schedule', {
                        templateUrl: "layout/default.html",
                        access: accessLevels.all
                    })
                    .state('schedule.content', {
                        url: "/schedule",
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dhc/schedule/schedule.html',
                                controller: 'ScheduleController'
                            }
                        },
                        resolve: {
                            offer: ['ActivityService', function (ActivityService) {
                                return ActivityService.getActivityOffers().then(function(offers) {
                                    return offers[_.random(0, offers.length)];
                                });
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('yp.dhc.schedule');
            }])

        .controller('ScheduleController', [ '$scope', '$rootScope', 'offer', 'ActivityService',
            function ($scope, $rootScope, offer, ActivityService) {

                $scope.offer = offer;
                $scope.plan = offer.activityPlan[0] || ActivityService.getDefaultPlan(offer.activity);


                // visibility
                $scope.plan.visibility = $scope.plan.visibility === 'campaign';

                // calendar & recurrence


                // one time planning using daypicker
                $scope.showWeeks = false;
                $scope.minDate = new Date();

                $scope.open = function () {
                    $timeout(function () {
                        $scope.opened = true;
                    });
                };
                $scope.dateOptions = {
                    'year-format': "'yy'",
                    'starting-day': 1
                };

                // weekplanning using dayselector
                $scope.availableDays = [
                    {label: 'MONDAY', value: "1"},
                    {label: 'TUESDAY', value: "2"},
                    {label: 'WEDNESDAY', value: "3"},
                    {label: 'THURSDAY', value: "4"},
                    {label: 'FRIDAY', value: "5"},
                    {label: 'SATURDAY', value: "6"},
                    {label: 'SUNDAY', value: "0"}
                ];

                function nextWeekday(date, weekday) {
                    if (!weekday) {
                        return date;
                    }
                    var input = moment(date);
                    var output = input.day(weekday);
                    return output > moment(date) ? output.toDate() : output.add('week', 1).toDate();
                }

                $scope.$watch('plan.source', function (newValue, oldValue) {
                    if (newValue && newValue === 'campaign') {
                        $scope.currentActivityPlan.executionType = 'group';
                        $scope.currentActivityPlan.visibility = 'campaign';
                    }
                });

                $scope.$watch('plan.weeklyDay', function (newValue, oldValue) {
                    if (newValue && $scope.currentActivityPlan.mainEvent.frequency === 'week') {
                        var duration = $scope.currentActivityPlan.mainEvent.end - $scope.currentActivityPlan.mainEvent.start;
                        $scope.currentActivityPlan.mainEvent.start = nextWeekday(new Date(), newValue);
                        $scope.currentActivityPlan.mainEvent.end = moment($scope.currentActivityPlan.mainEvent.start).add(duration);
                    }
                });


                $scope.saveActivityPlan = function() {

                    // currently start and end day is the same as only one date can be entered
                    // hack to ensure
                    // - that start and end is on the same day
                    var dateStart = new Date($scope.plan.mainEvent.start);
                    var dateEnd = new Date($scope.plan.mainEvent.end);
                    dateEnd.setYear(dateStart.getFullYear());
                    dateEnd.setMonth(dateStart.getMonth());
                    dateEnd.setDate(dateStart.getDate());
                    $scope.plan.mainEvent.end = dateEnd;

                    $scope.plan.visibility = $scope.plan.visibility ? 'campaign' : 'private';

                    ActivityService.savePlan($scope.plan).then(function (savedPlan) {
                        $rootScope.$emit('notification:success', 'activityPlan.save');

                        // if a campaign activity Plan has been created, send sample invite to the autor
                        var user = $scope.principal.getUser();
                        if (_.contains(user.roles, 'campaignlead') && savedPlan.source === 'campaign') {
                            $scope.$broadcast('formPristine');
                            ActivityService.inviteEmailToJoinPlan(user.email, savedPlan).then(function (result) {
                                $rootScope.$emit('notification:success', 'activityPlan.sampleInvitationSent', { values: { email: user.email }});
                            });
                        }

                        $scope.plan = savedPlan;

                    });
                }
            }
        ]);

}());