"use strict";

angular.module('yp-ewl-devmock', ['yp-ewl', 'ngMockE2E'])

    .run(function ($httpBackend, $log) {

        // let the normal server deliver our partials
        $httpBackend.whenGET(/^partials/).passThrough();
        $httpBackend.whenGET(/^js\/mockdata/).passThrough();

        $httpBackend.whenGET('/activities').respond(mock.activities);
        $httpBackend.whenGET('/activitiesPlanned').respond(mock.plannedActivities);

        $httpBackend.whenGET('assessment').respond(mock.assessment);
        $httpBackend.whenGET('assessment/answers').respond(mock.assessmentAnswers);

        $httpBackend.whenGET('comments').respond(mock.activityComments);

        $httpBackend.whenGET('/users').respond(mock.users);

        $httpBackend.whenPOST('/users').respond(function (method, url, data, headers) {
            mock.users.push(angular.fromJson(data));
            return [201, '', {location: '/users/' + data.username}];
        });

        $httpBackend.whenPUT(/\/users\//).respond(function (method, url, data, headers) {
            var index = _.findIndex(mock.users, function(obj) {
                return obj.id === data.id;
            });
            $log.info('PUT '+url + ' success, putting obj into mock users, obj: ' + angular.toJson(data));
            mock.users[index] = data;
            return [200, data, {}];
        });

        $httpBackend.whenGET('api/activitystats?range=weekly').respond(mock.activitystats.weekly);
        $httpBackend.whenGET('api/activitystats?range=monthly').respond(mock.activitystats.monthly);
        $httpBackend.whenGET('api/activitystats?range=yearly').respond(mock.activitystats.yearly);

        $httpBackend.whenGET('api/activitylog').respond(mock.activitylog);
        $httpBackend.whenGET('api/sociallog').respond(mock.sociallog);

        $httpBackend.whenGET('/campaigns').respond(mock.campaigns);


    });


