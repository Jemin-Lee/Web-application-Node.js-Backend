const usersController = require('../controllers/users.controller');
const authentication = require('../middleware/authentication');

module.exports = function (app) {
  app.route(app.rootUrl + '/users/:id/photo').get(usersController.getProfilePhoto);
  app.route(app.rootUrl + '/users/:id/photo').delete(authentication.setToken, usersController.deleteProfilePhoto);
  app.route(app.rootUrl + '/users/:id/photo').put(authentication.setToken, usersController.setProfilePhoto);
};
