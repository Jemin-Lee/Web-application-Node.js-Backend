const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

exports.hash = async function (password) {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

exports.compare = async function (reqData, foundData) {
    return await bcrypt.compare(reqData, foundData);
};
