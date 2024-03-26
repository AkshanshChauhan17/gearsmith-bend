import mysql from "mysql";

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "gsmith"
});

export default connection;