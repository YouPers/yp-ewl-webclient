var user = require('./common/user');

describe('GET home', function() {

    user.initialize('test_ind1', 'yp');
    user.logout();
    user.initialize('test_ind2', 'yp');

});