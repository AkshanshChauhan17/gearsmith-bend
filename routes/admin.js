import executeQuery from '../database/query.js';
import express from 'express';

const adminRouter = express.Router();

adminRouter.get('/all_users', (req, res) => {
    executeQuery("SELECT user_id, email, meta FROM user WHERE 1", [])
        .then((result) => {
            return res.json(result.map((d) => {
                d.image = JSON.parse(d.meta).profile_photo.small
                d.meta = []
                return d
            }));
        }).catch((error) => {
            return res.json(error);
        });
});

adminRouter.get('/one_user/:user_id', (req, res) => {
    const { user_id } = req.params;
    executeQuery("SELECT user_id, email, meta FROM user WHERE user_id=?", [user_id])
        .then((result) => {
            return res.json(result.map((d) => {
                d.user_dp = JSON.parse(d.meta).profile_photo.small
                d.user_meta = undefined
                d.meta = undefined
                return d
            }));
        }).catch((error) => {
            return res.json(error);
        });
});

adminRouter.get('all_products', (req, res) => {
    executeQuery("SELECT * FROM products WHERE 1", [])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});

adminRouter.get('all_orders', (req, res) => {
    executeQuery("SELECT * FROM product_order WHERE 1", [])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});

adminRouter.get('all_reviews', (req, res) => {
    executeQuery("SELECT * FROM product_review WHERE 1", [])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});

export default adminRouter;