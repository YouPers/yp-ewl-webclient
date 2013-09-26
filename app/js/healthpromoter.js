'use strict';

angular.module('yp.healthpromoter', ['restangular', 'ui.router', 'authentication'])

    .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
        function ($stateProvider, $urlRouterProvider, accessLevels) {
            $stateProvider
                .state('healthpromoter', {
                    url: "/healthpromoter",
                    templateUrl: "partials/healthpromoter.html",
                    controller: "HealthPromoterCtrl",
                    access: accessLevels.user
                });
        }])


    .factory('yp.healthpromoter.HealthPromoterService', ['$http', 'Restangular', function ($http, Restangular) {


        var myService = {


        };

        return myService;
    }])

    .controller('HealthPromoterCtrl', ['$scope', 'yp.healthpromoter.HealthPromoterService', '$state', '$stateParams', '$modal', '$log',
        function ($scope, HealthPromoterService, $state, $stateParams, $modal, $log) {

            $scope.open = function() {

                var modalInstance = $modal.open({
                    templateUrl: 'partials/healthpromoter.welcome.html',
                    controller: 'HealthPromoterWelcomeCtrl',
                    resolve: {
                        //items: function () {
                        //return $scope.items;
                        //}
                    },
                    backdrop: true
                });

                modalInstance.result.then(function (doNotShowAgain) {
                    // TODO (rblu): Save into preferences
                    $log.info('doNotShowAgain(healthPromoterWelcome): ' + doNotShowAgain);
                });
            };

            $scope.open();
        }])

    .controller('HealthPromoterWelcomeCtrl', ['$scope', '$modalInstance','$window',
        function ($scope, $modalInstance, $window) {
            $scope.doNotShowAgain = false;

            $scope.ok = function() {
                stopVideo();
                $modalInstance.close($scope.doNotShowAgain);
            };


            // TODO (rblu): clean this youtube code (global function to create player!
            // TODO (rblu): fix playing of video in Firefox!!!
            // 2. This code loads the IFrame Player API code asynchronously.
            var tag = document.createElement('script');

            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            // 3. This function creates an <iframe> (and YouTube player)
            //    after the API code downloads.
            var player;

            $window.onYouTubeIframeAPIReady = function () {
                player = new YT.Player('player', {
                    height: '230',
                    width: '360',
                    videoId: 'lBoaMTwZisU',
                    events: {
                        'onReady': $window.onPlayerReady,
                        'onStateChange': $window.onPlayerStateChange
                    }
                });
            };

            // 4. The API will call this function when the video player is ready.
            $window.onPlayerReady = function (event) {
                //event.target.playVideo();
            };

            // 5. The API calls this function when the player's state changes.
            //    The function indicates that when playing a video (state=1),
            //    the player should play for six seconds and then stop.
            //var done = false;

             $window.onPlayerStateChange = function (event) {
                //if (event.data == YT.PlayerState.PLAYING && !done) {
                //    setTimeout(stopVideo, 6000);
                //    done = true;
                //}
            };

            function stopVideo() {
                player.stopVideo();
            }
        }])

;

