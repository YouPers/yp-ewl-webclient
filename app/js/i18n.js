'use strict';

angular.module('i18n', ['pascalprecht.translate'])

    .controller('i18nCtrl', ['$scope', '$translate', function ($scope, $translate) {

        $scope.changeLang = function (key) {
            moment.lang(key);
            $translate.uses(key).then(function (key) {
                console.log("Sprache zu " + key + " gewechselt.");
            }, function (key) {
                console.log("Irgendwas lief schief.");
            });
        };

    }
    ]);
