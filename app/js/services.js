'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
  value('version', '0.1').


  factory('apiservice', function ($http) {

        var _serveruri= 'http://localhost:8080';

        // initialize ServerUri for CI and prod
        var hostname = window.location.hostname;
        console.log('hostname: ' + hostname);
        switch (hostname) {
            // CI Environment
            case 'ypwebapp.herokuapp.com':
                _serveruri = 'http://ypserverapp.herokuapp.com';
            // dev environment
            case 'localhost':
                break;
            // TODO: prod environment
            case 'prodserver':
                break;
            default:
                break;
        }
        console.log('using API URL: ' + _serveruri);

        var apiservice = {


            login: function(encodedCredentials, successCallback) {
                var config = {
                    headers: {
                        'Authorization': 'Basic ' + encodedCredentials
                    }
                };
                $http.get(_serveruri+'/user', config).success(successCallback);
            },

            getBaseURI: function () {
                return _serveruri;
            }
        }

        return apiservice;

    });
