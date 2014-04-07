var initialize = function (username, password) {

    login(username, password);
    assessment();

};

var login = function(username, password) {

    it('logs in and displays the users fullname', function() {

        browser.get('/');

        element(by.model('username')).sendKeys(username);
        element(by.model('password')).sendKeys(password + '\n');

        expect(element(by.binding('principal.getUser().fullname')).getText()).toBeDefined();
    });
};

var assessment = function() {

    it('does a quick and dirty initialization for later tests', function () {

        browser.get('/#/topics');
        element(by.css('.btn-yp-serviceselection')).click();

        browser.get('/#/assessment/525faf0ac558d40000000005');
        element(by.css('.ass-done-button button')).click();
    });
};

var logout = function() {

    it('logs out the user', function() {
        element(by.css('.user-nav-link')).click(); // clicking invisible element would result in an error
        element(by.css('.user-logout-link')).click();
    });
}

module.exports = {
    initialize: initialize,
    logout: logout
}