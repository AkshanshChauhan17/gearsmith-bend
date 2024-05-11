const executeQuery = require('../database/query.js');
const express = require("express");
const reviewRouter = express.Router();

reviewRouter.get('/', (req, res) => {
    executeQuery("SELECT * FROM review WHERE 1 ", [])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});

export default reviewRouter;