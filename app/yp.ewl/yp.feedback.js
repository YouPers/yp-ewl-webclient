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
                ]})
        }])
        .controller('FeedbackController', [ '$scope', '$rootScope', 'FeedbackService', 'UserService',
            function ($scope, $rootScope, FeedbackService, UserService) {

                $scope.contactInfo = UserService.principal.isAuthenticated() ? UserService.principal.getUser().name : false;

                $scope.submitFeedback = function() {
                    FeedbackService.postFeedback($scope.feedback);
                };
            }
        ])

        .factory("FeedbackService", ['$rootScope', 'Restangular',
            function ($rootScope, Rest) {

                var feedback = Rest.all('feedback');

                var FeedbackService = {

                    postFeedback: function(feedback, success, error) {
                        feedback.post(feedback).then(function(successResult) {
                            $rootScope.$broadcast('globalUserMsg', 'Thank you! Your feedback was sent.', 'success', 3000);
                            if(success) {success(successResult);}
                        }, function(errorResult) {
                            $rootScope.$broadcast('globalUserMsg', 'Error: ' + errorResult.data.message, 'danger', 3000);
                            if(error) {error(errorResult);}
                        });
                    }

                };

                return FeedbackService;

            }]);

}());