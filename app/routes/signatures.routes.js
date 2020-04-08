const signaturesController = require('../controllers/signatures.controller');
const authentication = require('../middleware/authentication');

module.exports = function (app) {
  app.route(app.rootUrl + '/petitions/:id/signatures')
  .get(signaturesController.getSignatures)
  .post(authentication.userLoginCheck, signaturesController.postSignature)
  .delete(authentication.userLoginCheck, signaturesController.deleteSignature);
};
