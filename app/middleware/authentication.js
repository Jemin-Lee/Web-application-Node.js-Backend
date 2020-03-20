const userModel =  require('../models/users.model');

exports.checkUserToken = async function (req, res, next) {
  const userToken = req.header('X-Authorization');

  try {
    const foundUserList = await userModel.findUserToken(userToken);

    if (!foundUserList[0]) {
      req.currentId = null;
    }else{
      req.currentId = foundUserList[0].user_id.toString();
      next();
    }
    }catch(err){
      res.status(500).send();
    }
};
