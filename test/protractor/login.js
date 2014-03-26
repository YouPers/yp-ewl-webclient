describe('GET home', function() {

    beforeEach(function() {
        browser.get('/');
    });


    it('logs in and displays the users fullname', function() {

        element(by.model('username')).sendKeys('test_ind1');
        element(by.model('password')).sendKeys('yp\n');

        expect(element(by.binding('principal.getUser().fullname')).getText()).toEqual('Test Individual 1');
    });

    it('does a quick and dirty assessment for later tests', function () {

        browser.get('/#/assessment/525faf0ac558d40000000005');

        element(by.css('.ass-done-button button')).click();
    });
});