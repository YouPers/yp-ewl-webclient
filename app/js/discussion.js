'use strict';


angular.module('yp.discussion', []).


    factory('CommentService', ['$http', function ($http) {
        var commentService = {};

        var comments = $http.get('comments').then(function (result) {
            return result.data;
        });

        commentService.getThreadsFor = function (objectType, objectId) {
            // return the testcomments we have loaded without checking object...
            return comments;
        };

        return commentService;
    }
    ])

    .controller('CommentCtrl', ['$scope', 'CommentService', 'principal', function ($scope, CommentService, principal) {

        $scope.$watch($scope.currentActivity, function () {
            if ($scope.currentActivity) {
                CommentService.getThreadsFor('Activity', $scope.currentActivity.id).then(function (data) {
                    $scope.threads = data;
                });
            }
        });

        $scope.submitNewComment = function (thread) {
            var newComment = {
                thread_id: thread.id,
                author: {
                    "id": principal.getUser().id,
                    "fullname": principal.getUser().fullname,
                    "pic": principal.getUser().avatar,
                    "link": ""
                },
                date: new Date(),
                text: thread.newComment
            };
            thread.newComment = null;
            thread.comments.push(newComment);
        };

        $scope.submitNewThread = function (threads) {
            var newThread = {
                "ref_obj_id": "1",
                "ref_obj": "activity",
                "author": {
                    "id": principal.getUser().id,
                    "fullname": principal.getUser().fullname,
                    "pic": principal.getUser().avatar,
                    "link": ""
                },
                "date": new Date(),
                "type": "generic",
                "text": threads.newThread,
                "comments": []
            };
            threads.newThread = '';
            threads.showNewThread = false;
            threads.unshift(newThread);
        };

    }]);

