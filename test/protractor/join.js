var user = require('./common/user');

var _ = require('lodash');

describe('GET home', function() {




    it('plans an activity with the first user', function() {


        ptor = protractor.getInstance();

        browser.get('/');

        // login user 1
        user.logout();
        user.initialize('test_ind1', 'yp');


        // go to select state

        browser.get('/#/select')

        // plan group activity

        var all = element.all(by.repeater('item in offers'));

        all.map(function(el){ return el.evaluate('item') }).then(function(items) {
            var index = _.findIndex(items, function(item) {
                return item.activity.defaultexecutiontype === 'group';
            });


            // TODO: reenable tests
            return;
            if(index < 0) {
                // no more group activities available
                // TODO: find a way to provide reliable test data
                return;
            }

            expect(index).toBeGreaterThan(-1);

            element.all(by.repeater('item in items')).get(index).click(); // navigate to card in carousel

            ptor.wait(function () {

                all.get(index).findElement(by.css('.schedule-link')).click(); // open card

                element(by.css('button.self')).click(); // open self tab
                element(by.css('.save-link button')).click(); // plan

                // login user 2
                user.logout();
                user.initialize('test_ind2', 'yp');


                browser.get('/#/select');

                // find offer by id to join

                all = element.all(by.repeater('item in offers'));

                all.map(function(el){ return el.evaluate('item') }).then(function(items) {
                    var index = _.findIndex(items, function(item) {
                        return item.activityPlan.length > 0;
                    });


                    element.all(by.repeater('item in items')).get(index).click(); // navigate to card in carousel
                    all.get(index).findElement(by.css('.schedule-link')).click(); // open card

                    element(by.css('.join-plan')).click();


                    browser.get('/#/plan');

                    // TODO: check if plan shows up here ( after refactoring of offerId -> activityPlanId )

                });

            }, 500);


        });



    });

    it('joins the activity plan with the second user', function() {

        // user.initialize('test_ind1', 'yp');

        // join group activity

    });
});