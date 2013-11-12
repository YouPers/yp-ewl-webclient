"use strict";

angular.module('yp-ewl-devmock', ['yp-ewl', 'ngMockE2E'])

    .run(function ($httpBackend, $log) {

        var baseURL = 'http://localhost:8000/api/v1';

        // let the normal server deliver our partials
        $httpBackend.whenGET(/^partials/).passThrough();
        $httpBackend.whenGET(/^js\/mockdata/).passThrough();

        $httpBackend.whenGET(baseURL + '/activities').respond(mock.activities);
        $httpBackend.whenGET(/activitiesPlanned/).respond(mock.plannedActivities);
        $httpBackend.whenGET(baseURL + '/activities/recommendations').respond(mock.recommendations);
        $httpBackend.whenGET(/activities/).respond(mock.activities);

        $httpBackend.whenPOST(baseURL + '/activitiesPlanned').respond(function(method, url, data, headers) {
            var plan = angular.fromJson(data);
            plan.id = '12341234';
            mock.plannedActivities.push(plan);
            return [201, '', {location: '/activitiesPlanned/' + plan.id}];
        });

        $httpBackend.whenGET(baseURL + '/assessments/525faf0ac558d40000000005').respond(mock.assessment);
        $httpBackend.whenGET(baseURL +  '/assessments/525faf0ac558d40000000005/results/newest').respond(mock.assessmentAnswers);
        $httpBackend.whenGET(baseURL +  '/assessments/525faf0ac558d40000000005/results?sort=timestamp:-1').respond(mock.assessmentAnswers);

        $httpBackend.whenPOST(baseURL +  '/assessments/525faf0ac558d40000000005/results').respond(function(method, url, data, headers) {
            var result = angular.fromJson(data);
            result.id = '12341234';
            mock.assessmentAnswers.push(result);
            return [201, '', {location: '/assessments/525faf0ac558d40000000005/results/' + result.id}];
        });

        $httpBackend.whenGET(/comments/).respond(mock.activityComments);
        $httpBackend.whenGET(baseURL + '/users').respond(mock.users);
        $httpBackend.whenPOST(baseURL + '/users').respond(function (method, url, data, headers) {
            mock.users.push(angular.fromJson(data));
            return [201, '', {location: '/users/' + data.username}];
        });

        $httpBackend.whenPOST(baseURL + '/login').respond(function (method, url, data, headers) {

            return [200, mock.users[1], {}];
        });


        $httpBackend.whenPUT(/\/users\//).respond(function (method, url, data, headers) {
            var index = _.findIndex(mock.users, function(obj) {
                return obj.id === data.id;
            });
            $log.info('PUT '+url + ' success, putting obj into mock users, obj: ' + angular.toJson(data));
            mock.users[index] = data;
            return [200, data, {}];
        });

        $httpBackend.whenGET('stressLevelStatus').respond(mock.stressLevelStatus);

        $httpBackend.whenGET(baseURL + '/activitystats?range=weekly').respond(mock.activitystats.weekly);
        $httpBackend.whenGET(baseURL + '/activitystats?range=monthly').respond(mock.activitystats.monthly);
        $httpBackend.whenGET(baseURL + '/activitystats?range=yearly').respond(mock.activitystats.yearly);

        $httpBackend.whenGET('/campaigns').respond(mock.campaigns);


    });