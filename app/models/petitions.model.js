const db = require('../../config/db');

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
}

exports.addPetition = async function(reqBody, userId){
  const query = `insert into Petition (title, description, author_id, category_id, created_date, closing_date) values (?,?,?,?,?,?)`;
  let today = new Date();
  const petitionData = [reqBody.title, reqBody.description, userId, reqBody.categoryId, today, reqBody.closingDate];
  try {
    const conn = await db.getPool().getConnection();
    const [result] = await conn.query(query, petitionData);
    conn.release();
    return result.insertId;
  }catch(err){
    throw err;
  }
};
