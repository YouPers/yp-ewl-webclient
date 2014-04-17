var initialize = function (username, password) {

    return login(username, password)
        .then(assessment);
};

var login = function (username, password) {
    var ptor = protractor.getInstance();

    browser.get('/#/signin');

    element(by.model('username')).sendKeys(username);
    element(by.model('password')).sendKeys(password + '\n');

    return ptor.isElementPresent(by.css('.modal-dialog')).then(function (isDisplayed) {
        if (isDisplayed) {
            element(by.css('.feedback-icon-1')).click();
            element(by.css('.btn-primary')).click()
                .then(function () {

                    expect(element(by.binding('principal.getUser().fullname')).getText()).toBeDefined();

                });

        }


    });


};

var assessment = function () {


    browser.get('#/topics');
    element(by.css('.btn-yp-serviceselection')).click();

    browser.get('/#/assessment/525faf0ac558d40000000005');
    element(by.css('.ass-done-button button')).click();
};

var logout = function () {
    var ptor = protractor.getInstance();
    return ptor.isElementPresent(by.css('.modal-dialog'))
        .then(function (modalPresent) {
            if (modalPresent) {
                element(by.css('.btn-primary')).click();
            }
        })
        .then(function () {
            var logoutElement = element(by.css('.user-nav-link'));
            logoutElement.isDisplayed()
                .then(function (isDisplayed) {

                    if (isDisplayed) {
                        logoutElement.click(); // clicking invisible element would result in an error
                        element(by.css('.user-logout-link')).click();
                    }
                });
        });
};

module.exports = {
    initialize: initialize,
    login: login,
    logout: logout
}