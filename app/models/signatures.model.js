const db = require('../../config/db');
const snakeCaseKeys = require('snakecase-keys');
const fs = require('mz/fs');

exports.getSignatures = async function (petitionId){
  const query = `select Signature.signatory_id, User.name, User.city, User.country, Signature.signed_date from Signature join Petition on Signature.petition_id = Petition.petition_id join User on Signature.signatory_id = User.user_id where Signature.petition_id = ? order by signed_date`;
  const conn = await db.getPool().getConnection();
  const users = await conn.query(query, petitionId);
  conn.release();
  return users[0];
};

exports.signedPetition =  async function (currentId){
  const query = `select petition_id from Signature where signatory_id = ?`;
  try{
    const conn = await db.getPool().getConnection();
    const signedPetitions = await conn.query(query, currentId);
    conn.release();
    return signedPetitions[0];
  }catch(err){
    throw err;
  }
};

exports.postSignature = async function (currentId, petitionId){
    const query = `insert into Signature (signatory_id, petition_id, signed_date) values (?,?,?)`;
    let today = new Date();
    try{
      const conn = await db.getPool().getConnection();
      await conn.query(query, [currentId, petitionId, today]);
      conn.release();
    }catch(err){
      throw err;
    }
};


exports.deleteSignature = async function (currentId, petitionId){
  const query = `delete from Signature where signatory_id = ? and petition_id = ?`;
  try{
    const conn = await db.getPool().getConnection();
    await conn.query(query, [currentId, petitionId]);
    conn.release();
  }catch(err){
    throw err;
  }
};
