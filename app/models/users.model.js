const db = require('../../config/db');
const passwords = require('../service/password');
const randomtoken = require('rand-token');
const fs = require('mz/fs');
const snakeCaseKeys = require('snakecase-keys');

exports.register = async function (user) {
    const query = `INSERT INTO User (name, email, password, city, country) VALUES (?, ?, ?, ?, ?)`;
    const userData = [user.name, user.email, await passwords.hash(user.password), user.city, user.country];
    const conn = await db.getPool().getConnection();
    const [result] = await conn.query(query, userData);
    conn.release();
    return result.insertId;
};


/*
login
*/
exports.login = async function (userId){
    const token = randomtoken.generate(32);
    const query = `update User set auth_token = ? where user_id = ?`;

    const userData = [token, userId];
    const conn = await db.getPool().getConnection();
    await conn.query(query, userData);
    conn.release();
    return {
      'userId': userId,
      'token': token
    };
};
exports.findUser = async function (email){
    try {
        const query = `select user_id, password from User where email = ?`;

        const conn = await db.getPool().getConnection();
        const [foundDataList] = await conn.query(query, email);
        conn.release();
        return foundDataList[0]
    }catch(err){
        return null;
    }
};


/*
logout
*/
exports.logout = async function (userId){
  const query = `update User set auth_token = null where user_id = ?`
  try {

    const conn = await db.getPool().getConnection();
    await conn.query(query, userId);
    conn.release();
  }catch(err){
    throw err;
  }
};
exports.findUserToken = async function (userToken){
    const query = `select user_id from User where auth_token = ?`;
    if (!userToken){
      return null;
    }
    try{
        const conn = await db.getPool().getConnection();
        const foundUserList = await conn.query(query, userToken);
        conn.release();
        if (!foundUserList[0].length) {
          return null;
        }else{
          return foundUserList[0];
        }
    }catch(err){
        throw err;
    }
};


/*
get user information
*/
exports.retrieveDetail = async function (reqId, currentId){
  const query = `select name, email, city, country from User where user_id = ?`;

  try{
    const conn = await db.getPool().getConnection();
    const [result] = await conn.query(query, reqId);
    conn.release();
    const userData = result[0];
    console.log(userData);
    if (!currentId){
      return {
        'name': userData.name,
        'city': userData.city,
        'country': userData.country
      };
    }
    return userData;
  }catch(err){
    return null;
  }
};


exports.update =async function (reqBody, userId) {
  const query = `update User set ? where user_id = ?`;
  console.log(snakeCaseKeys(reqBody));
  try {
    if (reqBody.password){
      changes.password = await passwords.hash(changes.password);
    }
    const conn = await db.getPool().getConnection();
    await conn.query(query, [snakeCaseKeys(reqBody),userId]);
  }catch(err){
    throw err;
  }
};


exports.getProfilePhoto = async function (userId){
  const query = `select photo_filename from User where user_id = ?`;

  try {
    const conn = await db.getPool().getConnection();
    const result = await conn.query(query, userId);
    const photoName = result[0][0].photo_filename;
    if (await fs.exists('./storage/photos/'+photoName)){
      const file = await fs.readFile('./storage/photos/'+photoName);
      let mimeType = "image/?";
      if (photoName.endsWith('jpg')||photoName.endsWith('jpeg')){
        mimeType = "image/jpeg";
      } else if(photoName.endsWith('png')){
        mimeType = "image/png";
      } else if (photoName.endsWith('gif')){
        mimeType = "image/gif";
      }
      return {
        'fileName': file,
        'mimeType': mimeType
      };
    }else{
      return null;
    }
  }catch(err){
    return null;
    throw(err);
  }
};
