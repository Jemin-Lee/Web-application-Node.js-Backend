const userModel =  require('../models/users.model');

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

    //checks if email has '@'
    if (!checkEmail(req.body.email)) {
        res.statusMessage = 'Invalid Email';
        res.status(400).send();
    }
    //check password
    if (!('password' in req.body) && (!checkEmpty(req.body.password))) {
        res.statusMessage = 'Password Empty';
        res.status(400).send();
    }
    //check name
    if (!('name' in req.body) && (!checkEmpty(req.body.name))){
        res.statusMessage = 'Name Empty';
        res.status(400).send();
    }else {
        try {
            const userId = await userModel.register(req.body);
            res.status(201)
                .json({userId});
        }catch(err){
            if (err.sqlMessage && err.sqlMessage.includes('Duplicate entry')){
                res.statusMessage = 'Username or Email already exists';
                res.status(400).send();
            }else{
                res.statusMessage='Server Error';
                res.status(500).send();
            }
        }
    }
};