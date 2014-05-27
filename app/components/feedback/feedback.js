(function () {
    'use strict';

    angular.module('yp.components.feedback', ['yp.components.user'])


        .config(['$stateProvider', '$urlRouterProvider', 'accessLevels', '$translateWtiPartialLoaderProvider',
            function ($stateProvider, $urlRouterProvider, accessLevels, $translateWtiPartialLoaderProvider) {

                $stateProvider
                    .state('feedback', {
                        url: '/feedback',
                        templateUrl: 'components/feedback/feedback.html',
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
                    'support',
                    'other'
                ]});
        }])

        .controller('FeedbackController', [ '$scope', '$rootScope', '$window', 'FeedbackService', 'UserService',
            function ($scope, $rootScope, $window, FeedbackService, UserService) {

                $scope.contactInfo = UserService.principal.isAuthenticated() ? UserService.principal.getUser().username : false;
                $scope.feedback = {};

                $scope.$watch('anonymous', function(val) {
                    if($scope.anonymous) {
                        $scope.feedback.contactInfo = "";
                    }
                });

                $scope.close = function() {
                    $window.close();
                };

                $scope.submitFeedback = function() {

                    $scope.submitting = true;

                    // copy username
                    if($scope.contactInfo && !$scope.anonymous) {
                        $scope.feedback.contactInfo = $scope.contactInfo;
                    }

                    $scope.feedback.navigator = JSON.stringify(_.pick(navigator, ['appCodeName','appName','appVersion','cookieEnabled',
                        'doNotTrack','language','onLine','platform','product','userAgent','vendor','vendorSub']));


                    // optimistic posting, don't wait for response
                    FeedbackService.postFeedback($scope.feedback).then(function() {
                        $scope.submitted = true;
                        $scope.feedback = {};

                    });


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

})();