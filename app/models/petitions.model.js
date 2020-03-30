const db = require('../../config/db');
const snakeCaseKeys = require('snakecase-keys');

exports.categories = async function() {
  const query = `select category_id, name from Category`;
  try {
    const conn = await db.getPool().getConnection();
    const categories = await conn.query(query);
    conn.release();
    return categories;
  } catch(err){
    throw err;
  }
};

exports.addPetition = async function(reqBody, userId){
  try {
    const query = `insert into Petition (title, description, author_id, category_id, created_date, closing_date) values (?,?,?,?,?,?)`;
    let today = new Date();
    const petitionData = [reqBody.title, reqBody.description, userId, reqBody.categoryId, today, reqBody.closingDate];
    const conn = await db.getPool().getConnection();
    const [result] = await conn.query(query, petitionData);
    conn.release();
    return result.insertId;
  }catch(err){
    throw err;
  }
};

exports.viewPetition = async function(petitionId){
  try {
    const query = `select title, User.name, description, author_id, city, country, created_date, closing_date from Petition join User on Petition.author_id = User.user_id where petition_id = ?`;
    const query2 = `select Category.name from Petition join Category on Category.category_id = Petition.category_id where petition_id = ?`;
    const query3 = `select COUNT (*) as "sig" FROM Signature WHERE petition_id = ?`

    const conn = await db.getPool().getConnection();
    const conn2 = await db.getPool().getConnection();
    const conn3 = await db.getPool().getConnection();

    const result = (await conn.query(query, petitionId))[0];
    const result2 = (await conn.query(query2, petitionId))[0];
    const result3 = (await conn.query(query3, petitionId))[0];

    conn.release();
    conn2.release();
    conn3.release();

    if (!result){
      return null;
    }else{
      return {
        'petitionId': petitionId,
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

exports.changePetition = async function (reqBody, petitionId){
  try{
    const query = `update Petition set ? where petition_id = ?`;
    console.log(snakeCaseKeys(reqBody));
    const conn = await db.getPool().getConnection();
    await conn.query(query, [snakeCaseKeys(reqBody),petitionId]);
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
