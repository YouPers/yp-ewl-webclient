'use strict';

function i18nCtrl($scope, $translate) {

    $scope.changeLang = function (key) {
        $translate.uses(key).then(function (key) {
            console.log("Sprache zu " + key + " gewechselt.");
        }, function (key) {
            console.log("Irgendwas lief schief.");
        });
    };

}
