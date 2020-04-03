const userModel =  require('../models/users.model');

exports.setToken = async function (req, res, next) {
  const userToken = req.header('X-Authorization');
  try {
    const foundUserList = await userModel.findUserToken(userToken);
    if (foundUserList !== null) {
      req.currentId = foundUserList[0].user_id.toString();
      next();
    } else{
      res.statusMessage = 'Unauthorized';
      res.status(401).send();
    }
  }catch(err){
    res.statusMessage = 'Internal Server Error';
      res.status(500).send();
  }
};
