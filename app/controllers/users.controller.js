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

    if ( (!checkEmail(req.body.email)) || (!('password' in req.body) && (checkEmpty(req.body.password))) || (!('name' in req.body) && (checkEmpty(req.body.name))) ) {
        console.log(1);
        res.statusMessage = 'Bad Request';
        res.status(400).send();
    }else {
        try {
            const userId = await userModel.register(req.body);
            res.status(201).json({userId});
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