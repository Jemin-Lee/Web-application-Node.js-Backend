const userModel =  require('../models/users.model');

exports.checkUserToken = async function (req, res, next) {
  const userToken = req.header('X-Authorization');

  try {
    const userMatch = await userModel.findUserToken(userToken);
    req.currentId = userMatch.user_id;
    next();
  }catch(err){
    res.status(500).send();
  }
}
