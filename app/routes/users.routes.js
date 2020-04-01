const usersController = require('../controllers/users.controller');
const authentication = require('../middleware/authentication');

module.exports = function (app) {
    app.route(app.rootUrl + '/users/register').post(usersController.register);
    app.route(app.rootUrl + '/users/login').post(usersController.login);
    app.route(app.rootUrl + '/users/logout').post(authentication.setToken, usersController.logout);
    app.route(app.rootUrl + '/users/:id').get(authentication.setToken, usersController.retrieveDetail);
    //app.route(app.rootUrl + '/users/:id').patch(authentication.setToken, usersController.changeDetails);

    app.route(app.rootUrl + '/users/:id/photo').get(usersController.getProfilePhoto)
    .put(authentication.setToken, usersController.setProfilePhoto)
    .delete(authentication.setToken, usersController.deleteProfilePhoto);

};
