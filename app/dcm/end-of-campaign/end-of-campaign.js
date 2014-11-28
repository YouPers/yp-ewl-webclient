(function () {
    'use strict';

    angular.module('yp.dcm')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('dcm.end-of-campaign', {
                        url: "/end",
                        access: accessLevels.user,
                        views: {
                            content: {
                                templateUrl: 'dcm/end-of-campaign/end-of-campaign.html',
                                controller: 'DcmEndOfCampaignController as endOfCampaignController'
                            }
                        },
                        resolve: {

                            jsInclude: ["util", function (util) {
                                return util.loadJSIncludes(['lib/d3/d3.min.js', 'lib/nvd3/nv.d3.min.js']);
                            }]

                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/end-of-campaign/end-of-campaign');
            }])

        .controller('DcmEndOfCampaignController', [ '$scope', 'UserService', 'StatsService',
            function ($scope, UserService, StatsService) {

                $scope.campaign = UserService.principal.getUser().campaign;
                $scope.daysLeft = - moment().diff($scope.campaign.end, 'days');
                $scope.campaignEnded = moment().diff($scope.campaign.end) > 0;

                init();

                function init() {


                    StatsService.loadStats($scope.campaign.id,
                        {
                            type: 'usersTotal',
                            scopeType: 'campaign',
                            scopeId: $scope.campaign.id
                        }).then(function (results) {
                            var res = results[0].usersTotal;

                            $scope.campaignParticipants = [
                                {
                                    "key": "Teilnehmer",
                                    "values": [ [ 'Deine Kampagne' , res.usersTotal], [ 'Durschnitt aller Kampagnen' , res.usersAvg]  ]
                                }
                            ];

                        });




                    $scope.eventStatusData = [
                        {
                            "key": "Deine Kampagne",
                            "values": [ [ 'done' , 2.3] , [ 'missed' , 2.1] , [ 'open' , 1.2] ]
                        },
                        {
                            "key": "Durschnitt aller Kampagnen",
                            "values": [ [ 'done' , 2.3] , [ 'missed' , 1.1] , [ 'open' , 4.6] ]
                        }
                    ];

                    $scope.eventFeedbackYAxisTickFormat = function (value) {
                        return value * 100 + '%';
                    };

                    $scope.eventFeedbackData = [
                        {
                            "key": "Durchschnittliche Bewertung",
                            "values": [ [ '1' , 0.2] , [ '3' , 0.4] , [ '5' , 0.1] ]
                        },
                        {
                            "key": "Durschnitt aller Kampagnen",
                            "values": [ [ '1' , 0.4] , [ '3' , 0.4] , [ '5' , 0.2] ]
                        }
                    ];



                    $scope.assessmentData = [
                        {
                            "key": "zu wenig",
                            "values": [ [ 'Kampagne' , 0.2] , [ 'Vergleichswert' , 0.25]]
                        },
                        {
                            "key": "etwas zu wenig",
                            "values": [ [ 'Kampagne' , 0.3] , [ 'Vergleichswert' , 0.15] ]
                        },
                        {
                            "key": "ausgewogen",
                            "values": [ [ 'Kampagne' , 0.20] , [ 'Vergleichswert' , 0.2] ]
                        },
                        {
                            "key": "etwas zu viel",
                            "values": [ [ 'Kampagne' , 0.20] , [ 'Vergleichswert' , 0.25] ]
                        },
                        {
                            "key": "zu viel",
                            "values": [ [ 'Kampagne' , 0.10] , [ 'Vergleichswert' , 0.15] ]
                        }
                    ];

                    $scope.colorFn = function (d, i) {

                        var colors = ['#FF541E', '#FFD05C', '#20C63C', '#FFD05C', '#FF541E'];
                        return colors[i];
                    }

                }




            }
        ]);

}());