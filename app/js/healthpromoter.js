'use strict';

angular.module('yp.healthpromoter', ['restangular', 'ui.router', 'yp.auth'])

    .config(['$stateProvider', '$urlRouterProvider', 'accessLevels',
        function ($stateProvider, $urlRouterProvider, accessLevels) {
            $stateProvider
                .state('healthpromoter', {
                    url: "/healthpromoter",
                    templateUrl: "partials/healthpromoter.html",
                    controller: "HealthPromoterCtrl",
                    access: accessLevels.all
                });
        }])


    .factory('yp.healthpromoter.HealthPromoterService', ['$http', 'Restangular', function ($http, Restangular) {

        var campaigns = Restangular.all('campaigns');


        var myService = {
            campaigns: campaigns.getList()
        };

        return myService;
    }])

    .controller('HealthPromoterCtrl', ['$scope', 'yp.healthpromoter.HealthPromoterService', '$state', '$stateParams', '$modal', '$log',
        function ($scope, HealthPromoterService, $state, $stateParams, $modal, $log) {

            $scope.healthpromoter =

            $scope.welcomeMsgOpen = function() {

                var modalInstance = $modal.open({
                    templateUrl: 'partials/healthpromoter.welcome.html',
                    controller: 'HealthPromoterWelcomeCtrl',
                    backdrop: true
                });

                modalInstance.result.then(function (doNotShowAgain) {
                    // TODO (rblu): Save into user-preferences
                    $log.info('doNotShowAgain(healthPromoterWelcome): ' + doNotShowAgain);
                    if (doNotShowAgain && $scope.principal.isAuthenticated()) {
                        var user = $scope.principal.getUser();
                        user.preferences.dismissedDialogs.push('HealthPromoterWelcome');
                        user.put();
                    }
                });
            };
            if ((!$scope.principal.isAuthenticated()) || ($scope.principal.getUser().preferences.dismissedDialogs.indexOf('HealthPromoterWelcome') === -1)) {
                $scope.welcomeMsgOpen();
            }

                HealthPromoterService.campaigns.then(function (data) {
                    $scope.campaigns = data;
                });



        }])

    .controller('HealthPromoterWelcomeCtrl', ['$scope', '$modalInstance','$window',
        function ($scope, $modalInstance, $window) {

            $scope.formModel = {
                doNotShowAgain: false
            };

            $scope.ok = function() {
                stopVideo();
                $modalInstance.close($scope.formModel.doNotShowAgain);
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
                        'onReady': onPlayerReady,
                        'onStateChange':onPlayerStateChange
                    }
                });
            };

            // 4. The API will call this function when the video player is ready.
            var onPlayerReady = function (event) {
                //event.target.playVideo();
            };

            // 5. The API calls this function when the player's state changes.
            //    The function indicates that when playing a video (state=1),
            //    the player should play for six seconds and then stop.
            //var done = false;

             var onPlayerStateChange = function (event) {
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

