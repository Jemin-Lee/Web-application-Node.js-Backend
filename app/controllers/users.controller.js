const userModel =  require('../models/users.model');
const passwords = require('../service/password');


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
            res.status(201).json({userId});
            return;
        }catch(err){
            if (err.sqlMessage && err.sqlMessage.includes('Duplicate entry')){
                res.statusMessage = 'Username or Email already exists';
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
    //search for user with an unique email
    const searchedUser = await userModel.findUser(req.body.email);
    if (searchedUser){
        const passwordCorrect = await passwords.compare(req.body.password, searchedUser.password);
        if (passwordCorrect){
            try{
                const result = await userModel.login(searchedUser.user_id);
                res.statusMessage='OK';
                res.status(200).json(result);
                return;
            }catch(err){
                res.status(500).send();
                return;
            }

        }else{
            res.statusMessage = 'Wrong Password';
            res.status(400).send();
            return;
        }
    } else{
        res.statusMessage='Invalid Email';
        res.status(400).send();
        return;
    }


};

exports.logout = async function (req, res) {
  try {
    await userModel.logout(req.currentId);
    res.statusMessage = 'OK';
    res.status(200).send();
  }catch(err){
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
    res.status(500).send();
    return;
  }
};

/*

exports.changeDetails = async function (req, res){

  if(!req.currentId){
    res.statusMessage = 'Forbidden';
    res.status(403).send();
  }else {
    const userInfo = await userModel.retrieveDetail(req.params.id, req.currentId);

    const searchedUser = await userModel.findPassword(req.currentId);
    const passwordCorrect = await passwords.compare(req.body.currentPassword, searchedUser.password);
  }

  if ((!('email' in req.body)) || (!checkEmail(req.body.email))){
      res.statusMessage = 'Bad Request1';
      res.status(400).send();
  }
  if ((!('name' in req.body)) || (!checkEmpty(req.body.name))) {
      res.statusMessage = 'Bad Request2';
      res.status(400).send();
  }
  if (!Number.isInteger(parseInt(req.params.id) || parseInt(req.params.id) < 1)){
    res.statusMessage = 'Bad Request3'
    res.status(400).send();
  }

  if (!userInfo){
    res.statusMessage = 'Bad Request4';
    res.status(400).send();
  }

  if (!passwordCorrect){
    res.statusMessage = 'Unauthorized';
    res.status(401).send();
  }


  else {
      try {
        const userId = await userModel.update(req.body, req.currentId);
        res.status(200).send();
      }catch(err){
              res.status(500).send();
      }
  }
};
*/


exports.getProfilePhoto = async function (req, res) {
  try {
    const photo = await userModel.getProfilePhoto(req.params.id);
    if (!photo){
      res.statusMessage = 'Not Found';
      res.status(404).send();
      return;
    } else{
      res.statusMessage = 'OK';
      res.status(200).contentType(photo.mimeType).send(photo.fileName);
      return;
    }
  }catch(err){
    res.status(500).send();
    return;
  }
};



exports.deleteProfilePhoto = async function (req, res){
  try{
    const userFound = await userModel.findUserId(req.currentId);
    const photo = await userModel.getFileName(req.currentId);
    if (!userFound){
      res.statusMessage = 'Not Found';
      res.status(404).send();
      return;
    }

    if (req.params.id !== req.currentId){
      res.statusMessage = 'Forbidden';
      res.status(403).send();
      return;
    }else{
      if(!photo){
        res.statusMessage = 'Not Found';
        res.status(404).send();
        return;
      }else{
        await userModel.deleteProfilePhoto(photo, req.currentId);
        res.statusMessage = 'OK';
        res.status(200).send();
      }
    }
  }catch(err){
    res.statusMessage = 'Internal Server Error';
    res.status(500).send();
  }
};



exports.setProfilePhoto = async function (req, res){
  const userFound = await userModel.findUserId(req.currentId);
  if (!userFound){
    res.statusMessage = 'Not Found';
    res.status(404).send();
    return;
  }
  if (req.params.id !== req.currentId){
    res.statusMessage = 'Forbidden';
    res.status(403).send();
    return;
  }

  const imageType = req.header('Content-Type');
  let imageExtension = '';
  switch (imageType) {
    case 'image/jpeg':
    imageExtension = '.jpg';
    break;
    case 'image/png':
    imageExtension = '.png';
    break;
    default:
    imageExtension = null;
    break;
  }
  if (imageExtension === null){
    res.statusMessage = 'Bad Request';
    res.status(400).send();
    return;
  }else {
    try{
      const photoExist = await userModel.getProfilePhoto(userId);
      if (photoExist) {
        const photo = await userModel.getFileName(userId);
        await userModel.deleteProfilePhoto(photo, userId);
        await userModel.setProfilePhoto(userId, req.body, imageExtension);
        res.statusMessage = 'OK';
        res.status(200).send();

      }else {
        await userModel.setProfilePhoto(userId, req.body, imageExtension);
        res.statusMessage = 'Created';
        res.status(201).send();

      }
    }catch(err){
      res.statusMessage = 'Internal Server Error';
      res.status(500).send();
    }
  }
};
