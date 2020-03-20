const userModel =  require('../models/users.model');
const passwords = require('../service/password');

function checkEmail(email){
    //email include @
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
    }
    if ((!('password' in req.body)) || (!checkEmpty(req.body.password))){
        res.statusMessage = 'Empty password';
        res.status(400).send();
    }
    if ((!('name' in req.body)) || (!checkEmpty(req.body.name))) {
        res.statusMessage = 'Empty Name';
        res.status(400).send();
    } else {
        try {
            const userId = await userModel.register(req.body);
            res.status(201)
                .json({userId});
        }catch(err){
            if (err.sqlMessage && err.sqlMessage.includes('Duplicate entry')){
                res.statusMessage = 'Username or Email already exists';
                res.status(400).send();
            }else{
                res.status(500).send();
            }
        }
    }
};

exports.login = async function (req, res) {
    //search for user with an unique email
    const searchedUser = await userModel.findUser(req.body.email);
    if (searchedUser){
        //compare password
        const passwordCorrect = await passwords.compare(req.body.password, searchedUser.password);
        if (passwordCorrect){
            try{
                const result = await userModel.login(searchedUser.user_id);
                res.statusMessage='OK';
                res.status(200).json(result);
            }catch(err){
                res.status(500).send();
            }

        }else{
            res.statusMessage = 'Wrong Password';
            res.status(400).send();
        }
    } else{
        res.statusMessage='Invalid Email';
        res.status(400).send();
    }


};

exports.logout = async function (req, res) {
  const userId = req.currentId;
  try {
    if (userId===null){
      res.statusMessage = 'Unauthorized';
      res.status(401).send();
    } else{
      await userModel.logout(req.currentId);
      res.statusMessage = 'OK';
      res.status(200).send();
    }
  }catch(err){
    console.log('here');
    res.status(500).send();
  }
};
