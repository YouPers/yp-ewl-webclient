'use strict';

/* jasmine specs for directives go here */

describe('ewl-assessment', function() {
  beforeEach(module('yp.ewl.assessment'));

  describe('assessment ', function() {
    it('should be defined', inject(function(AssessmentService) {
        expect(AssessmentService.getAssessment(1)).toBeDefined();
      }))
    });
});
