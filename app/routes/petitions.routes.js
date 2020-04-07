const petitionsController = require('../controllers/petitions.controller');
const authentication = require('../middleware/authentication');

module.exports = function (app) {
  app.route(app.rootUrl + '/petitions/:id')
  //.get(petitionsController.getPetition)
  .patch(authentication.userLoginCheck, petitionsController.patchPetition)
  .delete(authentication.userLoginCheck, petitionsController.deletePetition);

  app.route(app.rootUrl + '/petitions')
  .post(authentication.userLoginCheck, petitionsController.postPetition);

  app.route(app.rootUrl + '/petitions/categories')
  .get(petitionsController.getCategories);

  app.route(app.rootUrl + '/petitions/:id/photo')
  .get(petitionsController.getPetitionPhoto);
};
