const db = require('../../config/db');
const passwords = require('../service/password');

exports.register = async function (user) {

    console.log(user);

    const query = `INSERT INTO User (name, email, password, city, country) VALUES (?, ?, ?, ?, ?)`;
    const userData = [user.name, user.email, user.password, user.city, user.country];

    try {
        const conn = await db.getPool().getConnection();
        const result = await conn.query(query, userData);
        conn.release();
        return result.insertId;
    }catch(err){
        throw err;
    }

};