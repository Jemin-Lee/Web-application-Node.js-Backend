const usersControll = require('../controllers/users.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/users/register').post(usersControll.register);
    app.route(app.rootUrl + '/users/login').post(usersControll.login);
    app.route(app.rootUrl + '/users/logout').post(authentication.checkUserToken, usersControll.logout);
};
