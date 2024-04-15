import executeQuery from '../database/query.js';
import express from 'express';

const adminRouter = express.Router();

adminRouter.get('/all_users', (req, res) => {
    executeQuery("SELECT user_id AS id, is_admin, email, meta FROM user WHERE 1", [])
        .then((result) => {
            return res.json(result.map((d) => {
                d.user_dp = JSON.parse(d.meta).profile_photo.small;
                const meta = JSON.parse(d.meta);
                meta.profile_photo = undefined;
                d.meta = meta;
                return d;
            }));
        }).catch((error) => {
            return res.json(error);
        });
});

adminRouter.get('/count_users', (req, res) => {
    executeQuery("SELECT count(*) AS users FROM user WHERE 1", [])
        .then((result) => {
            return res.json(...result);
        }).catch((error) => {
            return res.json(error);
        });
});

adminRouter.get('/count_orders', (req, res) => {
    executeQuery("SELECT count(*) AS orders FROM all_order WHERE 1", [])
        .then((result) => {
            return res.json(...result);
        }).catch((error) => {
            return res.json(error);
        });
});

adminRouter.get('/count_reviews', (req, res) => {
    executeQuery("SELECT count(*) AS reviews FROM product_rating WHERE 1", [])
        .then((result) => {
            return res.json(...result);
        }).catch((error) => {
            return res.json(error);
        });
});

adminRouter.get('/view_user/:user_id', (req, res) => {
    const { user_id } = req.params;
    executeQuery("SELECT user_id, email, meta FROM user WHERE user_id=?", [user_id])
        .then((result) => {
            return res.json(...result.map((d) => {
                d.meta = JSON.parse(d.meta);
                return d;
            }));
        }).catch((error) => {
            return res.json(error);
        });
});

adminRouter.get('/revenue_graph_data', (req, res) => {
    executeQuery("SELECT timestamp as name, total_cost as Total FROM all_order WHERE is_conform=1", [])
        .then((result) => {
            return res.json(result.map((d) => {
                d.name = new Date(d.name).toLocaleDateString()
                return d
            }));
        }).catch((error) => {
            return res.json(error);
        });
});

adminRouter.get('/user/revenue_graph_data/:user_id', (req, res) => {
    const { user_id } = req.params;
    executeQuery("SELECT timestamp as name, total_cost as Total FROM all_order WHERE is_conform=1 AND user_id=?", [user_id])
        .then((result) => {
            return res.json(result.map((d) => {
                d.name = new Date(d.name).toLocaleDateString()
                return d
            }));
        }).catch((error) => {
            return res.json(error);
        });
});

adminRouter.get('/earning', (req, res) => {
    executeQuery("SELECT SUM(total_cost) AS earning FROM all_order WHERE is_conform=1", [])
        .then((result) => {
            return res.json(...result);
        }).catch((error) => {
            return res.json(error);
        });
});

adminRouter.delete('/delete_user/:user_id', (req, res) => {
    const { user_id } = req.params;
    executeQuery("DELETE FROM user WHERE user_id=?", [user_id])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});

adminRouter.patch('/action_user/:user_id', (req, res) => {
    const { user_id } = req.params;
    const { action, value } = req.body;
    switch (action) {
        case "admin":
            executeQuery("UPDATE INTO user SET is_admin=? WHERE user_id=?", [value, user_id])
                .then((result) => {
                    return res.json(result);
                }).catch((error) => {
                    return res.json(error);
                });
            break;
        case "block":
            executeQuery("UPDATE INTO user SET is_block=? WHERE user_id=?", [value, user_id])
                .then((result) => {
                    return res.json(result);
                }).catch((error) => {
                    return res.json(error);
                });
            break;
        default:
            res.json({ status: false, message: "Please select valid action!!!" });
    };
});

adminRouter.get('/all_products', (req, res) => {
    executeQuery("SELECT * FROM product WHERE 1", [])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});

adminRouter.get('/all_orders', (req, res) => {
    executeQuery("SELECT * FROM all_order ORDER BY timestamp DESC LIMIT 10", [])
        .then((result) => {
            return res.json(result.map((r) => {
                r.product_list = JSON.parse(r.product_list);
                r.user_meta = JSON.parse(r.user_meta);
                return r;
            }));
        }).catch((error) => {
            return res.json(error);
        });
});

adminRouter.get('/all_reviews', (req, res) => {
    executeQuery("SELECT * FROM product_review WHERE 1", [])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});

export default adminRouter;