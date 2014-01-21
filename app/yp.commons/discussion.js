'use strict';


angular.module('yp.discussion', ['restangular']).


    factory('CommentService', ['$http','Restangular', '$rootScope', function ($http, Restangular, $rootScope) {
        var commentService = {};
        var comments = Restangular.all('comments');


        commentService.getCommentsFor = function (objectId) {
            return comments.getList({'filter[refDoc]': objectId, populate: 'author', sort: 'created:-1'});
        };

        commentService.submitNewComment =  function (comment, successCallback) {
            comments.post(comment).then(function (result) {
                $rootScope.$broadcast('globalUserMsg', 'Comment saved', 'success', 3000);
            }, function(err) {
                $rootScope.$broadcast('globalUserMsg', err.data.message, 'warning', 3000);
            }).then(successCallback);
        };
        return commentService;
    }
    ])

    .controller('CommentCtrl', ['$scope', 'CommentService', 'principal', '$location', function ($scope, CommentService, principal, $location) {
        $scope.principal = principal;

        $scope.$watch($scope.currentActivity, function () {
            if ($scope.currentActivity) {
                CommentService.getCommentsFor($scope.currentActivity.id).then(function (data) {
                    $scope.comments = data || [];
                });
            }
        });


        $scope.submitNewComment = function (text) {
            var newComment = {
                "refDoc": $scope.currentActivity.id,
                "refDocModel":'Activity',
                "refDocTitle": $scope.currentActivity.number + ": " + $scope.currentActivity.title,
                "refDocLink": $location.path(), // api URL $scope.currentActivity.getRestangularUrl(),
                "author":  principal.getUser().id,
                "created": new Date(),
                "text": text
            };
            CommentService.submitNewComment(newComment);
            $scope.comments.unshift(newComment);
            newComment.author = principal.getUser();
            $scope.showNewComment = false;
            $scope.newText = '';
        };

    }]);

