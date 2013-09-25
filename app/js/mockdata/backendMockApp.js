"use strict";

angular.module('yp-ewl-devmock', ['yp-ewl', 'ngMockE2E'])

    .run(function ($httpBackend) {

        // let the normal server deliver our partials
        $httpBackend.whenGET(/^partials/).passThrough();
        $httpBackend.whenGET(/^js\/mockdata/).passThrough();

        $httpBackend.whenGET('api/activities').respond(mock.activities);
        $httpBackend.whenGET('api/activitiesPlanned').respond(mock.plannedActivities);

        $httpBackend.whenGET('api/assessment').respond(mock.assessment);
        $httpBackend.whenGET('api/assessment/answers').respond(mock.assessmentAnswers);

        $httpBackend.whenGET('api/comments').respond(mock.activityComments);

        $httpBackend.whenGET('/api/users').respond(mock.users);
        $httpBackend.whenPOST('api/users').respond(function (method, url, data, headers) {
            mock.users.push(angular.fromJson(data));
            return [201, '', {location: '/api/users/' + data.username}];
        });

        $httpBackend.whenGET('api/activitystats?range=weekly').respond(mock.activitystats.weekly);
        $httpBackend.whenGET('api/activitystats?range=monthly').respond(mock.activitystats.monthly);
        $httpBackend.whenGET('api/activitystats?range=yearly').respond(mock.activitystats.yearly);

        $httpBackend.whenGET('api/activitylog').respond(mock.activitylog);
        $httpBackend.whenGET('api/sociallog').respond(mock.sociallog);

    });


