const petitionsController = require('../controllers/petitions.controller');
const authentication = require('../middleware/authentication');

module.exports = function (app) {
  app.route(app.rootUrl + '/petitions/:id/photo')
  .get(petitionsController.getPetitionPhoto);
};
