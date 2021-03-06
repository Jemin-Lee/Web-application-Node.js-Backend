const userModel =  require('../models/users.model');
const passwords = require('../service/password');
const randomtoken = require('rand-token');


function checkEmail(email){
    return email.includes('@')
}

function checkEmpty(input){
    if (!input){
        return false;
    }else{
        //input empty || only white-space || null
        return !(input.length === 0 || !input.trim() || !input);
    }
}

exports.register = async function (req, res) {

    if ((!('email' in req.body)) || (!checkEmail(req.body.email))){
        res.statusMessage = 'Invalid Email';
        res.status(400).send();
        return;
    }
    if ((!('password' in req.body)) || (!checkEmpty(req.body.password))){
        res.statusMessage = 'Empty password';
        res.status(400).send();
        return;
    }
    if ((!('name' in req.body)) || (!checkEmpty(req.body.name))) {
        res.statusMessage = 'Empty Name';
        res.status(400).send();
        return;
    } else {
        try {
            const userId = await userModel.register(req.body);
            res.statusMessage = 'Created';
            res.status(201).json({userId});
            return;
        }catch(err){
            if (err.sqlMessage){
                res.statusMessage = 'Bad Request';
                res.status(400).send();
                return;
            }else{
                res.status(500).send();
                return;
            }
        }
    }
};

exports.login = async function (req, res) {
  try{
    const searchedUser = await userModel.findUser(req.body.email);
    if (searchedUser){
        const passwordCorrect = await passwords.compare(req.body.password, searchedUser.password);
        if (passwordCorrect){
          const result = await userModel.login(searchedUser.user_id);
          res.statusMessage='OK';
          res.status(200).json(result);
          return;
        }else{
          res.statusMessage = 'Wrong Password';
          res.status(400).send();
          return;
        }
    } else{
      res.statusMessage='Bad Request';
      res.status(400).send();
      return;
    }
  }catch(err){
    res.statusMessage = 'Internal Server Error';
    res.status(500).send();
    return;
  }
};

exports.logout = async function (req, res) {
  try {
    await userModel.logout(req.currentId);
    res.statusMessage = 'OK';
    res.status(200).send();
  }catch(err){
    res.statusMessage = 'Internal Server Error';
    res.status(500).send();
  }
};

exports.retrieveDetail = async function (req, res) {
  try{
    const userInfo = await userModel.retrieveDetail(req.params.id,req.currentId);
    if (!userInfo){
      res.statusMessage = 'Not Found';
      res.status(404).send();
      return;
    }else{
      res.statusMessage = 'OK';
      res.status(200).json(userInfo);
      return;
    }
  }catch(err){
    res.statusMessage = 'Internal Server Error';
    res.status(500).send();
    return;
  }
};

exports.changeDetails = async function (req, res){
  if ('email' in req.body){
    if (!checkEmail(req.body.email)){
        res.statusMessage = 'Bad Request1';
        res.status(400).send();
        return;
    }
  }
  if ('name' in req.body){
    if (!checkEmpty(req.body.name)) {
        res.statusMessage = 'Bad Request2';
        res.status(400).send();
        return;
    }
  }
  if (!Number.isInteger(parseInt(req.params.id) || parseInt(req.params.id) < 1)){
    res.statusMessage = 'Bad Request3'
    res.status(400).send();
    return;
  }

  if(req.params.id !== req.currentId){
    res.statusMessage = 'Forbidden';
    res.status(403).send();
    return;
  }

  if('currentPassword' in req.body){
    const currentPassword = await userModel.findPassword(req.currentId);
    const passwordCorrect = await passwords.compare(req.body.currentPassword, currentPassword.password);
    delete req.body['currentPassword'];
    if (!passwordCorrect){
      res.statusMessage = 'Unauthorized';
      res.status(401).send();
      return;
    }
  }

  try {
    const userInfo = await userModel.retrieveDetail(req.params.id, req.currentId);
    if (userInfo){
      const userId = await userModel.update(req.body, req.currentId);
      res.status(200).send();
      return;
    }else{
      res.statusMessage = 'Bad Request4';
      res.status(400).send();
      return;
    }
  }catch(err){
    res.statusMessage = 'Internal Server Error';
    res.status(500).send();
    return;
  }
};



exports.getProfilePhoto = async function (req, res) {
  try {
    const photoName = await userModel.getPhotoName(req.params.id);
    if (!photoName){
      res.statusMessage = 'Not Found';
      res.status(404).send();
    } else{
      const readPhoto = await userModel.readPhoto(photoName);
      res.statusMessage = 'OK';
      res.status(200).contentType(readPhoto.mimeType).send(readPhoto.fileName);
    }
  }catch(err){
    res.statusMessage = 'Internal Server Error';
    res.status(500).send();
  }
};





exports.deleteProfilePhoto = async function (req, res){
  try{
    if (!await userModel.findUserId(req.params.id)){
      res.statusMessage = 'Not Found';
      res.status(404).send();
      return;
    }

    if (req.params.id !== req.currentId){
      res.statusMessage = 'Forbidden';
      res.status(403).send();
      return;
    }else{
      const photoExist = await userModel.getPhotoName(req.currentId);
      if(!photoExist){
        res.statusMessage = 'Not Found';
        res.status(404).send();
        return;
      }else{
        await userModel.unlinkPhoto(photoExist);
        await userModel.putProfilePhoto(req.currentId, null);
        res.statusMessage = 'OK';
        res.status(200).send();
        return;
      }
    }
  }catch(err){
    res.statusMessage = 'Internal Server Error';
    res.status(500).send();
    return;
  }
};



exports.putProfilePhoto = async function (req, res){
  if (!await userModel.findUserId(req.params.id)){
    res.statusMessage = 'Not Found';
    res.status(404).send();
    return;
  }
  if (req.params.id !== req.currentId){
    res.statusMessage = 'Forbidden';
    res.status(403).send();
    return;
  }

  let imageExtension = null;
  switch (req.header('Content-Type')){
    case 'image/jpeg':
    imageExtension = '.jpg';
    break;
    // case 'image/gif':
    // imageExtension = '.gif';
    // break;
    case 'image/png':
    imageExtension = '.png';
    break;
  }
  if (imageExtension === null){
    res.statusMessage = 'Bad Request';
    res.status(400).send();
    return;
  }

  try{
    const photoExist = await userModel.getPhotoName(req.currentId);
    if (!photoExist) {
      const imageName = await userModel.writePhoto(req.body, imageExtension);
      await userModel.putProfilePhoto(req.currentId, imageName);
      res.statusMessage = 'Created';
      res.status(201).send();
      return;
    }else {
      await userModel.unlinkPhoto(photoExist);
      const imageName = await userModel.writePhoto(req.body, imageExtension);
      await userModel.putProfilePhoto(req.currentId, imageName);
      res.statusMessage = 'OK';
      res.status(200).send();
      return;
    }
  }catch(err){
    res.statusMessage = 'Internal Server Error';
    res.status(500).send();
    return;
  }

};
