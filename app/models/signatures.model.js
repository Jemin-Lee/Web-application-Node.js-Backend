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

exports.signPetition = async function (currentId, petitionId){
  const query = `select signed_date from Signature where signatory_id = ?`;
  const conn = await db.getPool().getConnection();
  const signedDate = await conn.query(query, currentId);
  conn.release();

  if (!signedDate[0][0]){
    const query2 = `insert into Signature (signatory_id, petition_id, signed_date) values (?,?,?)`;
    const conn2 = await db.getPool().getConnection();
    conn2.release();
    let today = new Date();

    try{
      await conn2.query(query2, [currentId, petitionId, today]);
      return 1;
    }catch(err){
      throw err;
    }
  }else{
    return null;
  }

};


exports.unsignPetition = async function (currentId, petitionId){
  const query = `select signed_date from Signature where signatory_id = ?`;
  const conn = await db.getPool().getConnection();
  const signedDate = await conn.query(query, currentId);
  conn.release();

  if (signedDate[0][0]){
    const query2 = `delete from Signature where signatory_id = ? and petition_id = ?`;


    try{
      const conn2 = await db.getPool().getConnection();
      await conn2.query(query2, [currentId, petitionId]);
      conn2.release();
      return 1;
    }catch(err){
      throw err;
    }
  }else{
    return null;
  }
};
