var initialize = function (username, password) {

    login(username, password);
    assessment();

};

var login = function(username, password) {


    browser.get('/');

    element(by.model('username')).sendKeys(username);
    element(by.model('password')).sendKeys(password + '\n');

    expect(element(by.binding('principal.getUser().fullname')).getText()).toBeDefined();
};

var assessment = function() {


    browser.get('/#/topics');
    element(by.css('.btn-yp-serviceselection')).click();

    browser.get('/#/assessment/525faf0ac558d40000000005');
    element(by.css('.ass-done-button button')).click();
};

var logout = function() {

    try {

        var logoutElement = element(by.css('.user-nav-link'));

        logoutElement.isDisplayed().then(function(isDisplayed) {

            if(isDisplayed) {
                logoutElement.click(); // clicking invisible element would result in an error
                element(by.css('.user-logout-link')).click();
            }
        });

    } catch(e) {
        // already logged out
    }
}

module.exports = {
    initialize: initialize,
    login: login,
    logout: logout
}