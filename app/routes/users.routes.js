const usersController = require('../controllers/users.controller');
const authentication = require('../middleware/authentication');

module.exports = function (app) {
    app.route(app.rootUrl + '/users/register')
    .post(usersController.register);

    app.route(app.rootUrl + '/users/login')
    .post(usersController.login);

    app.route(app.rootUrl + '/users/logout')
    .post(authentication.userLoginCheck, usersController.logout);

    app.route(app.rootUrl + '/users/:id')
    .get(authentication.setToken, usersController.retrieveDetail)
    .patch(authentication.userLoginCheck, usersController.changeDetails);


    app.route(app.rootUrl + '/users/:id/photo')
    .get(usersController.getProfilePhoto)
    .put(authentication.userLoginCheck, usersController.putProfilePhoto)
    .delete(authentication.userLoginCheck, usersController.deleteProfilePhoto);

};
