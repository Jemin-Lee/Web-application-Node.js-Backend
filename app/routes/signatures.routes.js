const signaturesController = require('../controllers/signatures.controller');
const authentication = require('../middleware/authentication');

module.exports = function (app) {
  app.route(app.rootUrl + '/petitions/:id/signatures')
  .get(signaturesController.viewSignatures);

  app.route(app.rootUrl + '/petitions/:id/signatures')
  .post(authentication.setToken, signaturesController.signPetition);
  
  app.route(app.rootUrl + '/petitions/:id/signatures')
  .delete(authentication.setToken, signaturesController.unsignPetition);
};
