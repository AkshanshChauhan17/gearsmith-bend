import executeQuery from '../database/query.js';
import express from 'express';

const navigationRouter = express.Router();

navigationRouter.get('/', (req, res) => {
    executeQuery("SELECT * FROM navigation WHERE 1", [])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});

export default navigationRouter;