const userModel =  require('../models/users.model');

exports.setToken = async function (req, res, next) {
  const userToken = req.header('X-Authorization');
  try {
    const foundUserList = await userModel.findUserToken(userToken);
    if (foundUserList !== null) {
      req.currentId = foundUserList[0].user_id.toString();
    } else{
      req.currentId = null;
      res.statusMessage = 'Unauthorized';
      res.status(401).send();
    }
    next();
  }catch(err){
      res.status(500).send();
  }
};
