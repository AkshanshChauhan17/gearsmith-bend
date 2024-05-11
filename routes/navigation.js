const executeQuery = require('../database/query.js');
const express = require("express");

const navigationRouter = express.Router();

navigationRouter.get('/', (req, res) => {
    executeQuery("SELECT * FROM navigation WHERE 1", [])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});

module.exports = navigationRouter;