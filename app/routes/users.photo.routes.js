const usersController = require('../controllers/users.controller');
const authentication = require('../middleware/authentication');

module.exports = function (app) {
  app.route(app.rootUrl + '/users/:id/photo').get(usersController.getProfilePhoto)
  .delete(authentication.userLoginCheck, usersController.deleteProfilePhoto)
  .put(authentication.userLoginCheck, usersController.setProfilePhoto);
};
