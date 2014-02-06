(function () {
    'use strict';

    angular.module('yp.activity')

        .filter('nextEvents', function () {
            return function (input) {
                var onlyPassed = [];
                for (var i = 0; i < input.length; i++) {
                    if (input[i].event.status === "done" ||
                        input[i].event.status === "missed") {
                        onlyPassed.push(input[i]);
                    }
                }
                return onlyPassed;
            };
        })

        .filter('filterEvents', function () {
            return function (input, filter) {
                if (!input) {
                    return input;
                }
                var filteredEvents = [];
                var currentTimeStamp = new Date();
                var currentDate = new Date(
                    currentTimeStamp.getFullYear(),
                    currentTimeStamp.getMonth(),
                    currentTimeStamp.getDate());
                if (typeof filter === 'undefined') {
                    return input;
                }
                if (filter !== "passedEvents" &&
                    filter !== "nextEvents") {
                    return input;
                }
                for (var i = 0; i < input.length; i++) {
                    var eventBeginnDate = new Date(input[i].event.begin);
                    if (filter === "passedEvents" &&
                        eventBeginnDate < currentDate) {
                        filteredEvents.push(input[i]);
                    } else if (filter === "nextEvents" &&
                        eventBeginnDate >= currentDate) {
                        filteredEvents.push(input[i]);

                    }
                }

                return filteredEvents;
            };
        })

        // Hack, um den String "Uhr" aus den generierten Zeiten zu entfernen
        .filter('stripUhr', function () {
            return function (input) {
                return input.replace("Uhr", "");
            };
        });

}());