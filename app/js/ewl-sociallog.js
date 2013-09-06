'use strict';


angular.module('yp.sociallog', []).

    factory('SocialLogService', ['$http', function ($http) {

        var socialLogService = {};

        var socialLogEntries = $http.get('js/mockdata/testsociallog.json').then(function (result) {
            return result.data;
        })

        socialLogService.getSocialLog = function () {
            return socialLogEntries;
        }

        return socialLogService;
    }
    ])

    .controller('SocialLogCtrl', ['$scope', 'SocialLogService', function ($scope, SocialLogService) {

        $scope.socialLogEntries = SocialLogService.getSocialLog();

        $scope.getGlyphicon = function(status) {
            var icon = "";
            if (status == "newMessage") {
                icon = "envelope";
            } else if (status == "readMessage") {
                icon = "ok";
            } else {
                icon = "star";
            }
            return icon;
        }

//        $scope.submitNewComment = function (thread) {
//            var newComment = {
//                thread_id: thread.id,
//                author: {
//                    link: 'bla',
//                    fullname: 'Reto Blunschi',
//                    pic: 'assets/pics/RBLU.jpeg'
//                },
//                date: new Date(),
//                text: thread.newComment
//            }
//            thread.newComment=null;
//            thread.comments.push(newComment);
//        }

//        $scope.submitNewThread = function (threads) {
//            var newThread = {
//                "ref_obj_id": 1,
//                "ref_obj": "activity",
//                "author": {
//                    "id": 1,
//                    "fullname": "Urs Baumeler",
//                    "pic": "assets/img/UBAU.jpeg",
//                    "link": "#/u/UBAU"
//                },
//                "date": new Date(),
//                "type": "generic",
//                "text": threads.newThread,
//                "comments": []
//            }
//            threads.newThread = '';
//            threads.showNewThread = false;
//            threads.unshift(newThread);
//        }

    }])
    
