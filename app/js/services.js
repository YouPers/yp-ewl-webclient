'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
    value('version', '0.1').


    factory('activityService', function ($http) {


        function Activity(id, title, text, af, plCat) {
            this.id = id;
            this.title = title;
            this.text = text;
            this.field = af;
            this.planningCat = plCat;
        }

        var actService = {

            allActivities: function () {
                return $http.get('js/testactivities.json.js').then(function (result) {
                    return result.data;
                });
            },

            plannedActivities: function () {
                return $http.get('js/testplannedactivities.json.js').then(function(result) {
                        return result.data;
                    }

                )

            }
        }

        return actService;


    })
;
