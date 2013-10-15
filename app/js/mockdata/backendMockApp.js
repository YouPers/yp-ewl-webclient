"use strict";

angular.module('yp-ewl-devmock', ['yp-ewl', 'ngMockE2E'])

    .run(function ($httpBackend, $log) {


        // let the normal server deliver our partials
        $httpBackend.whenGET(/^partials/).passThrough();
        $httpBackend.whenGET(/^js\/mockdata/).passThrough();

        $httpBackend.whenGET('/activities').respond(mock.activities);
        $httpBackend.whenGET('/activitiesPlanned').respond(mock.plannedActivities);
        $httpBackend.whenPOST('/activitiesPlanned').respond(function(method, url, data, headers) {
            var plan = angular.fromJson(data);
            plan.id = '12341234';
            mock.plannedActivities.push(plan);
            return [201, '', {location: '/activitiesPlanned/' + plan.id}];
        });

        $httpBackend.whenGET('/assessments/1').respond(mock.assessment);
        $httpBackend.whenGET(/\/users\/\w+\/assessmentresults\/[\w+]/).respond(mock.assessmentAnswers);

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

        $httpBackend.whenGET('stressLevelStatus').respond(mock.stressLevelStatus);

        $httpBackend.whenGET('activitystats?range=weekly').respond(mock.activitystats.weekly);
        $httpBackend.whenGET('activitystats?range=monthly').respond(mock.activitystats.monthly);
        $httpBackend.whenGET('activitystats?range=yearly').respond(mock.activitystats.yearly);

        $httpBackend.whenGET('activityLog').respond(mock.activityLog);
        $httpBackend.whenGET('socialLog').respond(mock.socialLog);

        $httpBackend.whenGET('/campaigns').respond(mock.campaigns);


    });