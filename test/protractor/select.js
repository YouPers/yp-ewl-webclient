var user = require('./common/user');

describe('GET home', function() {

    it('navigates to the "select" state', function() {

        browser.get('/#/select');

        var all = element.all(by.repeater('item in offers'));
        all.then(function (items) {
            expect(items.length).toBeGreaterThan(5);
        });
    });
});