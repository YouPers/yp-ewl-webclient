describe('GET home', function() {

    beforeEach(function() {
        browser.get('/');
    });


    it('login and display the users fullname', function() {

        element(by.model('username')).sendKeys('test_ind1');
        element(by.model('password')).sendKeys('yp\n');

        expect(element(by.binding('principal.getUser().fullname')).getText()).toEqual('TEST INDIVIDUAL 1');
    });
});