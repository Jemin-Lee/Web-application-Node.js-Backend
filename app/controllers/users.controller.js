const userModel =  require('../models/users.model');
const fs = require("fs");

function checkEmail(email){
    return email.includes('@')
}

exports.register = async function (req, res) {

    try {
        const userId = await userModel.register(req.body);

        res.status(200)
            .json({userId})
            .send('User created');
    }catch(err){
        throw err;
    }
};