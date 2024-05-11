const connection = require('./connection.js');

export default function executeQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (error, results, fields) => {
            if (error) {
                console.error('Error executing query: ' + error);
                reject(error);
                return;
            }
            resolve(results);
        });
    });
};