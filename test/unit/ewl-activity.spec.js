'use strict';

/* jasmine specs for filters go here */

describe('ewl activity', function() {
  beforeEach(module('yp.ewl.activity'));


  describe('ActivityService', function() {

    it('allActivities should be defined', inject(function(ActivityService) {
      expect(ActivityService.allActivities).toBeDefined();
    }));
  });
});
