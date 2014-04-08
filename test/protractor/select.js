describe('GET home', function() {

    beforeEach(function() {
        browser.get('/');
    });


    it('navigates to the "select" state', function() {

        browser.get('/#/select');

        var all = element.all(by.repeater('item in offers'));
        all.then(function (items) {
            expect(items.length).toBeGreaterThan(1);
        });
    });
});