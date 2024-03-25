import mysql from "mysql";

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "gearsmith"
});

export default connection;