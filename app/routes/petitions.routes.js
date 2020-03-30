const petitionsController = require('../controllers/petitions.controller');
const authentication = require('../middleware/authentication');

module.exports = function (app) {
  app.route(app.rootUrl + '/petitions/:id').get(petitionsController.viewPetition);
  app.route(app.rootUrl + '/petitions/:id').patch(authentication.setToken, petitionsController.changePetition);
  app.route(app.rootUrl + '/petitions/:id').delete(authentication.setToken, petitionsController.deletePetition);
  app.route(app.rootUrl + '/petitions').post(authentication.setToken, petitionsController.addPetition);
};
