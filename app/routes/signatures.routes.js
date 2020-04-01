const signaturesController = require('../controllers/signatures.controller');
const authentication = require('../middleware/authentication');

module.exports = function (app) {
  app.route(app.rootUrl + '/petitions/:id/signatures').get(signaturesController.viewSignatures)
  .post(authentication.setToken, signaturesController.signPetition)
  .delete(authentication.setToken, signaturesController.unsignPetition);
};
