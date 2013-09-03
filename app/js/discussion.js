'use strict';


angular.module('yp.discussion', []).


    factory('CommentService', ['$http', function ($http) {
        var commentService = {};

        var comments = $http.get('js/mockdata/testcomments.json').then(function (result) {
            return result.data;
        })

        commentService.getThreadsFor = function (objectType, objectId) {
            return comments;
        }

        return commentService;
    }
    ])

    .controller('CommentCtrl', ['$scope', 'CommentService', 'ActivityService', function ($scope, CommentService, ActivityService) {
        CommentService.getThreadsFor('Activity', ActivityService.getSelectedActivity().id).then(function (data) {
            $scope.threads = data;
        });

        $scope.submitNewComment = function (thread) {
            var newComment = {
                thread_id: thread.id,
                author: {
                    link: 'bla',
                    fullname: 'Reto Blunschi',
                    pic: 'assets/pics/RBLU.jpeg'
                },
                date: new Date(),
                text: thread.newComment
            }
            thread.newComment=null;
            thread.comments.push(newComment);
        }

        $scope.submitNewThread = function (threads) {
            var newThread = {
                "ref_obj_id": 1,
                "ref_obj": "activity",
                "author": {
                    "id": 1,
                    "fullname": "Urs Baumeler",
                    "pic": "assets/img/UBAU.jpeg",
                    "link": "#/u/UBAU"
                },
                "date": new Date(),
                "type": "generic",
                "text": threads.newThread,
                "comments": []
            }
            threads.newThread = '';
            threads.showNewThread = false;
            threads.unshift(newThread);
        }

    }])


