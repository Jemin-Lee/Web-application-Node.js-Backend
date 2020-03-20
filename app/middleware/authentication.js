const userModel =  require('../models/users.model');

exports.checkUserToken = async function (req, res, next) {
  const userToken = req.header('X-Authorization');
  const userMatch = await userModel.findUserToken(userToken);
  req.currentId = userMatch.user_id;
  console.log(req.currentId);
  console.log(req.currentId.toString());
  next();
}
