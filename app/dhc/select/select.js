(function () {
    'use strict';

    angular.module('yp.dhc')

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {
                $stateProvider
                    .state('select', {
                        templateUrl: "layout/default.html",
                        access: accessLevels.all
                    })
                    .state('select.content', {
                        url: "/select?offset",
                        reloadOnSearch: false,
                        access: accessLevels.all,
                        views: {
                            content: {
                                templateUrl: 'dhc/select/select.html',
                                controller: 'SelectController'
                            }
                        },
                        resolve: {
                            offers: ['SocialInteractionService', function(SocialInteractionService) {
                                return SocialInteractionService.getRecommendations({populate: 'idea author'})
                                    .then(function(recs) {
                                        _.forEach(recs, function(rec) {
                                             var types = _.map(rec.spaces, 'type');
                                             if (_.contains(types, 'campaign')) {
                                                 rec.sourceType = 'campaign';
                                             } else if (rec.author.id === '53348c27996c80a534319bda') {
                                                 rec.sourceType = 'youpers';
                                             } else {
                                                 rec.sourceType = 'community';
                                             }
                                        });
                                        return recs;
                                    });
                            }]
                        }
                    });

                $translateWtiPartialLoaderProvider.addPart('dhc/select/select');
            }])

        .controller('SelectController', [ '$scope', '$rootScope', '$stateParams', '$location', '$window', '$timeout', 'offers', 'ProfileService',
            function ($scope, $rootScope, $stateParams, $location, $window, $timeout, offers, ProfileService) {

                $scope.offers = offers;

                // watch window width to adjust number of items displayed
                $scope.$watch(function() {
                    return $window.innerWidth;
                }, function() {


                    var dimensions = [
//                        480,
                        768,
//                        992,
                        1200
                    ];

                    var width = $window.innerWidth;
                    var n = 0;

                    if(width < dimensions[0]) {
                        n = 1;
                    } else if(width < dimensions[1]) {
                        n = 2;
                    } else {
                        n = 3;
                    }
                    $scope.cardsPerView = n;

                } );



                $scope.reject = function(index, event) {
                    event.stopPropagation();

                    var user = $scope.principal.getUser();
                    // add it to the collection of rejected Activities in the profile
                    user.profile.prefs.rejectedActivities.push({idea: $scope.offers[index].idea.id, timestamp: new Date()});
                    // remove it from the starred list
                    _.remove(user.profile.prefs.starredActivities, function (starred) {
                        return starred.idea === $scope.offers[index].idea.id;
                    });

                    // save the profile
                    ProfileService.putProfile(user.profile);
                    $scope.offers.splice(index, 1);

                };

                $scope.schedule = function(idea) {
                    $scope.$state.go('schedule.offer', {id: idea.id});
                };

            }
        ]);

}());