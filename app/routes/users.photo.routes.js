const usersController = require('../controllers/users.controller');
const authentication = require('../middleware/authentication');

module.exports = function (app) {
  app.route(app.rootUrl + '/users/:id/photo').get(usersController.getProfilePhoto)
  .delete(authentication.loginRequired, usersController.deleteProfilePhoto)
  .put(authentication.loginRequired, usersController.setProfilePhoto);
};
