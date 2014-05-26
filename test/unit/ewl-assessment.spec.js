'use strict';

/* jasmine specs for directives go here */

describe('ewl-assessment', function () {
    beforeEach(module('pascalprecht.translate'));
    beforeEach(angular.mock.module('yp.components'));
    beforeEach(module('yp.activity'));
    beforeEach(module('yp.assessment'));

    describe('assessment ', function () {
        it('should be defined', inject(function (AssessmentService) {
            expect(AssessmentService.getAssessmentData(1)).toBeDefined();
        }))
    });
});
