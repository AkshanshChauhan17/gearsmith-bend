import mysql from "mysql";

var connection = mysql.createPool({
    host: "localhost",
    user: "root",
    database: "gsmith",
    debug: false
});

export default connection;