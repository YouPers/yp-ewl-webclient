'use strict';


angular.module('yp.discussion', []).


    factory('CommentService', ['$http', function ($http) {
        var commentService = {};

        commentService.getThreadsFor = function (objectType, objectId) {
            return $http.get('js/mockdata/testcomments.json').then(function (result) {
                return result.data;
            })
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
                date:  new Date(),
                text:   thread.newComment
            }

            thread.comments.push(newComment);
        }

    }])


