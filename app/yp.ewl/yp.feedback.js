(function () {
    'use strict';

    angular.module('yp.feedback', [])

        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {

                $stateProvider
                    .state('feedback', {
                        url: '/feedback',
                        templateUrl: 'yp.ewl/yp.feedback.html',
                        controller: 'FeedbackController',
                        access: accessLevels.all
                    });
            }])

        .run(['enums', function (enums) {
            _.merge(enums, {
                feedbackCategory: [
                    'bug',
                    'improvement',
                    'question',
                    'support'
                ]});
        }])
        .controller('FeedbackController', [ '$scope', '$rootScope', 'FeedbackService', 'UserService',
            function ($scope, $rootScope, FeedbackService, UserService) {

                $scope.contactInfo = UserService.principal.isAuthenticated() ? UserService.principal.getUser().username : false;

                $scope.$watch('anonymous', function(val) {
                    if($scope.anonymous) {
                        $scope.feedback.contactInfo = "";
                    }
                });

                $scope.submitFeedback = function() {

                    // copy username
                    if($scope.contactInfo && !$scope.anonymous) {
                        $scope.feedback.contactInfo = $scope.contactInfo;
                    }

                    $scope.feedback.navigator = JSON.stringify(_.pick(navigator, ['appCodeName','appName','appVersion','cookieEnabled',
                        'doNotTrack','language','onLine','platform','product','userAgent','vendor','vendorSub']));


                    // optimistic posting, don't wait for response
                    FeedbackService.postFeedback($scope.feedback);

                    $scope.feedback = {};
                    $rootScope.$emit('clientmsg:success', 'notification.success.feedback');
                };
            }
        ])

        .factory("FeedbackService", ['$rootScope', 'Restangular',
            function ($rootScope, Rest) {

                var feedbackResource = Rest.all('feedback');

                var FeedbackService = {

                    postFeedback: function(feedback) {
                        return feedbackResource.post(feedback);
                    }

                };

                return FeedbackService;

            }]);

}());