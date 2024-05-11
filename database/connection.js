const mysql = require("mysql");

var connection = mysql.createPool({
    host: "localhost",
    password: "8923445377akshansh",
    user: "wirczeht_akshansh",
    database: "wirczeht_gsmith",
    debug: false,
    connectionLimit: 1000
});

module.exports = connection;