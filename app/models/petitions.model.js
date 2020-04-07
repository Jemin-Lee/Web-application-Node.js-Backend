const db = require('../../config/db');
const snakeCaseKeys = require('snakecase-keys');
const randomtoken = require('rand-token');
const fs = require('mz/fs');

const petitionsController = require('../controllers/petitions.controller');

exports.getPetition = async function(petitionId){

    const query = `select petition_id, title, User.name, description, author_id, city, country, created_date, closing_date from Petition join User on Petition.author_id = User.user_id where petition_id = ?`;
    const query2 = `select name from Category join Petition on Petition.category_id = Category.category_id where petition_id = ?`;
    const query3 = `select COUNT (*) as "sig" FROM Signature WHERE petition_id = ?`

  try {
    const conn = await db.getPool().getConnection();
    const conn2 = await db.getPool().getConnection();
    const conn3 = await db.getPool().getConnection();

    const result = (await conn.query(query, petitionId))[0];
    const result2 = (await conn.query(query2, petitionId))[0];
    const result3 = (await conn.query(query3, petitionId))[0];

    conn.release();
    conn2.release();
    conn3.release();

    if ((result.length < 1) || (result2.length < 1)){
      return null;

    }else{
      return {
        'petitionId': result[0].petition_id,
        'title': result[0].title,
        'category': result2[0].name,
        'authorName': result[0].name,
        'signatureCount': result3[0].sig,
        'description': result[0].description,
        'authorId': result[0].author_id,
        'authorCity': result[0].city,
        'authorCountry': result[0].country,
        'createdDate': result[0].created_date,
        'closingDate': result[0].closing_date
      };
    }
  }catch(err){
    throw err;
  }
};


exports.categories = async function() {
  const query = `select category_id, name from Category`;
  try {
    const conn = await db.getPool().getConnection();
    const categories = await conn.query(query);
    conn.release();
    return categories;
  } catch(err){
    errors.logSqlError(err);
    throw err;
  }
};

exports.postPetition = async function(reqBody, userId){
  try {
    console.log(userId);
    const query = `insert into Petition (title, description, author_id, category_id, created_date, closing_date) values (?,?,?,?,?,?)`;
    let today = new Date();
    const petitionData = [
      reqBody.title,
      reqBody.description,
      userId,
      reqBody.categoryId,
      today,
      reqBody.closingDate
    ];
    const conn = await db.getPool().getConnection();
    const [result] = await conn.query(query, petitionData);
    conn.release();
    return result.insertId;
  }catch(err){
    throw err;
  }
};


exports.patchPetition = async function (reqBody, petitionId){
  try{
    const query = `update Petition set ? where petition_id = ?`;
    const conn = await db.getPool().getConnection();
    await conn.query(query, [snakeCaseKeys(reqBody), petitionId]);
    conn.release();
  }catch(err){
    throw err;
  }
};

exports.deletePetition = async function (petitionId){
  try{
    const query = `delete from Petition where petition_id = ?`;
    const conn = await db.getPool().getConnection();
    await conn.query(query, petitionId);
    conn.release();
  }catch(err){
    throw err;
  }
};


exports.getPhotoName = async function (petitionId){
  const query = `select photo_filename from Petition where petition_id = ?`;
  try{
    const conn = await db.getPool().getConnection();
    const result = await conn.query(query, petitionId);
    conn.release();
    const photoName = result[0][0].photo_filename;
    return photoName;
  }catch(err){
    return null;
    throw err;
  }
};

exports.readPhoto = async function (fileName){
  try{
    if (await fs.exists('./storage/photos/' + fileName)){
      const file = await fs.readFile('./storage/photos/' + fileName);

      let mimeType = "application/octet-stream";
      if (fileName.endsWith('jpeg')||fileName.endsWith('jpg')){
        mimeType = "image/jpeg";
      } else if(fileName.endsWith('png')){
        mimeType = "image/png";
      } else if (fileName.endsWith('gif')){
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
    throw err;
  }
};

exports.putProfilePhoto = async function (petitionId, imageName){

  const query = `update Petition set photo_filename = ? where petition_id = ?`;
  try {
    const conn = await db.getPool().getConnection()
    await conn.query(query, [imageName, petitionId]);
    conn.release();
  }catch(err){
    throw err;
  }
};

exports.writePhoto = async function(reqBody, fileType){
  const imageName = randomtoken.generate(16) + fileType;
  try{
    await fs.writeFile('./storage/photos/' + imageName, reqBody);
    return imageName;
  }catch(err){
    throw err;
  }
};

exports.unlinkPhoto = async function (fileName){
  try{
    if (await fs.exists('./storage/photos/' + fileName)){
      await fs.unlink('./storage/photos/' + fileName);
    }
  }catch(err){
    throw err;
  }
};

exports.findPetitionId = async function (reqId){
  const query = `select title, author_id from Petition where petition_id = ?`;

  try{
    const conn = await db.getPool().getConnection();
    const [result] = await conn.query(query, reqId);
    conn.release();

    const petitionData = result[0];
    if (petitionData.length < 1){
      return null;
    }else{
      return petitionData;
    }

  }catch(err){
    return null;
    throw err;
  }
};
