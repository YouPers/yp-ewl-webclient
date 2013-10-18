'use strict';


angular.module('yp.discussion', ['restangular']).


    factory('CommentService', ['$http','Restangular', '$rootScope' , function ($http, Restangular, $rootScope) {
        var commentService = {};
        var comments = Restangular.all('comments');


        commentService.getThreadsFor = function (objectId) {
            return comments.getList({refObj: objectId, populate: 'author', sort: 'date:-1'});
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

    .controller('CommentCtrl', ['$scope', 'CommentService', 'principal', function ($scope, CommentService, principal) {

        $scope.$watch($scope.currentActivity, function () {
            if ($scope.currentActivity) {
                CommentService.getThreadsFor($scope.currentActivity.id).then(function (data) {
                    $scope.threads = data;
                });
            }
        });

        $scope.submitNewComment = function (thread) {
            var newComment = {
                refObj: thread.id,
                author: principal.getUser().id,
                date: new Date(),
                text: thread.newComment
            };
            CommentService.submitNewComment(newComment);
            newComment.author = principal.getUser();
            thread.comments.push(newComment);
            thread.newComment = null;
        };

        $scope.submitNewThread = function (threads) {
            var newComment = {
                "refObj": $scope.currentActivity.id,
                "author":  principal.getUser().id,
                "date": new Date(),
                "text": threads.newThread
            };
            CommentService.submitNewComment(newComment);
            newComment.author = principal.getUser();
            threads.newThread = '';
            threads.showNewThread = false;
            threads.unshift(newComment);
        };

    }]);

