const userModel =  require('../models/users.model');

exports.setToken = async function (req, res, next) {
  const userToken = req.header('X-Authorization');
  try {
    const foundUserList = await userModel.findUserToken(userToken);
    if (foundUserList !== null) {
      req.currentId = foundUserList[0].user_id.toString();
    } else{
      req.currentId = null;
    }
    next();
  }catch(err){
      res.status(500).send();
  }
};
