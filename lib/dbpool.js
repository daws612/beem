var mysql = require('mysql');
const util = require('util');

var pool = mysql.createPool({
    connectionLimit: 100,
    host: '127.0.0.1',
    user: 'beem',
    password: 'beem',
    database: 'beem',
    multipleStatements: true
});

pool.query = util.promisify(pool.query);
module.exports = pool;