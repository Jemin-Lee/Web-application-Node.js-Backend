const db = require('../../config/db');
const passwords = require('../service/password');
const randomtoken = require('rand-token');

exports.register = async function (user) {
    const query = `INSERT INTO User (name, email, password, city, country) VALUES (?, ?, ?, ?, ?)`;
    const userData = [user.name, user.email, await passwords.hash(user.password), user.city, user.country];
    const conn = await db.getPool().getConnection();
    const [result] = await conn.query(query, userData);
    conn.release();
    return result.insertId;

};

exports.login = async function (userId){
    const token = randomtoken.generate(32);
    const query = `update User set auth_token = ? where user_id = ?`;

    const userData = [token, userId];
    const conn = await db.getPool().getConnection();
    await conn.query(query, userData);
    conn.release();
    result = {'userId': userId, 'token': token};
    return result
};

exports.findUser = async function (email){
    try {
        const query = `select user_id, password from User where email = ?`;

        const conn = await db.getPool().getConnection();
        const [foundDataList] = await conn.query(query, email);
        conn.release();
        return foundDataList[0]
    }catch(err){
        return null
    }

};

exports.logout = async function (userId){
  const query = `update User set auth_token = null where user_id = ?`

  try {
    conn = await db.getpool().getConnection();
    await conn.query(query, userId);
  }catch(err){
    throw err;
  }
};


exports.findUserToken = async function (userToken){
    const query = `select user_id from User where auth_token = ?`;
    try{
        const conn = await db.getPool().getConnection();
        const foundUserList = await conn.query(query, userToken);
        conn.release();
        if (foundUserList.length == 0) {
          return null;
        }else{
          return foundUserList[0];
        }

    }catch(err){
        throw err;
    }
};