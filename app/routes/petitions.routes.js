const petitionsController = require('../controllers/petitions.controller');
const authentication = require('../middleware/authentication');

module.exports = function (app) {
  app.route(app.rootUrl + '/petitions').post(authentication.setToken, petitionsController.addPetition);

  app.route(app.rootUrl + '/petitions/categories').get(petitionsController.viewCategories);

  app.route(app.rootUrl + '/petitions/:id').get(petitionsController.viewPetition)
  .patch(authentication.setToken, petitionsController.changePetition);
  //.delete(authentication.setToken, petitionsController.deletePetition);

  app.route(app.rootUrl + '/petitions/:id/photo').get(petitionsController.viewPetitionPhoto);
};
