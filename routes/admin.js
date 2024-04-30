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
            return res.json(result.map((e) => {
                e.media = JSON.parse(e.media)[0].small;
                return e;
            }));
        }).catch((error) => {
            return res.json(error);
        });
});


adminRouter.get('/one_product/:id', (req, res) => {
    const { id } = req.params;
    executeQuery("SELECT * FROM product WHERE id=?", [id])
        .then((result) => {
            return res.json(result.map((e) => {
                e.media = JSON.parse(e.media)[0].medium;
                e.discount = Math.round(((e.previous_price - e.price) / e.previous_price) * 100) + "%";
                return e;
            }));
        }).catch((error) => {
            return res.json(error);
        });
});

adminRouter.get('/one_product_edit/:id', (req, res) => {
    const { id } = req.params;
    executeQuery("SELECT product.* FROM product WHERE id=?", [id])
        .then((result) => {
            return res.json(result.map((e) => {
                e.media = JSON.parse(e.media);
                return e;
            }));
        }).catch((error) => {
            return res.json(error);
        });
});

adminRouter.get('/inner_one_product/:product_id', (req, res) => {
    const { product_id } = req.params;
    executeQuery("SELECT * FROM product WHERE product_id=?", [product_id])
        .then((result) => {
            return res.json(result.map((e) => {
                e.media = JSON.parse(e.media)[0].small;
                e.discount = Math.round(((e.previous_price - e.price) / e.previous_price) * 100) + "%";
                return e;
            }));
        }).catch((error) => {
            return res.json(error);
        });
});

adminRouter.delete('/delete_product/:product_id', (req, res) => {
    const { product_id } = req.params;
    executeQuery("DELETE FROM product WHERE product_id=?", [product_id])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});

adminRouter.patch('/edit_product', (req, res) => {
    const { product_id, name, is_available, new_price, previous_price } = req.body;
    executeQuery("UPDATE product SET name=?, is_available=?, price=?, previous_price=? WHERE product_id=?", [name, is_available, new_price, previous_price, product_id])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});

adminRouter.patch('/edit_inner_product', (req, res) => {
    const { summary, color_list, size_list, size_table, detail, disclaimer, media, product_id } = req.body;
    console.log(color_list)
    executeQuery("UPDATE product SET product_summary=?, size_list=?, color_list=?, size_table=?, detail=?, disclaimer=?, media=? WHERE product_id=?", [summary, size_list, color_list, size_table, detail, disclaimer, media, product_id])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});

adminRouter.get('/user/orders/:user_id', (req, res) => {
    const { user_id } = req.params;
    executeQuery("SELECT * FROM all_order WHERE user_id=? ORDER BY timestamp DESC", [user_id])
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

adminRouter.get('/home/all_orders', (req, res) => {
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

adminRouter.get('/all_orders', (req, res) => {
    executeQuery("SELECT * FROM all_order ORDER BY timestamp DESC", [])
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

adminRouter.get('/one_order/:id', (req, res) => {
    const { id } = req.params;
    executeQuery("SELECT * FROM all_order WHERE id=?", [id])
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

adminRouter.delete('/delete_order/:order_id', (req, res) => {
    const { order_id } = req.params;
    executeQuery("DELETE FROM all_order WHERE order_id=?", [order_id])
        .then((result) => {
            return res.json(result);
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