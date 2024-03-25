import executeQuery from "../database/query.js";
import express from "express";
import { v4 as uuidV4 } from "uuid";
import multer from "multer";

const productRouter = express.Router();

productRouter.get('/', (req, res) => {
    executeQuery("SELECT * FROM products WHERE 1", [])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});

productRouter.get('/new_arrive', (req, res) => {
    executeQuery("SELECT * FROM products ORDER BY id DESC LIMIT 10", [])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});

productRouter.get('/:product_name', (req, res) => {
    const { product_name } = req.params;

    executeQuery("SELECT * FROM products WHERE name=?", [product_name])
        .then((result) => {
            return res.json(...result);
        }).catch((error) => {
            return res.json(error);
        });
});

productRouter.post('/add_product', (req, res) => {
    const product_id = uuidV4();
    const { name, media, price, color_list, size_list, product_summary } = req.body;

    executeQuery("INSERT INTO products (name, media, price, product_id, color_list, size_list, product_summary) VALUES (?, ?, ?, ?, ?, ?, ?)", [name, JSON.stringify(media), price, product_id, JSON.stringify(color_list), JSON.stringify(size_list), product_summary])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});

productRouter.delete('/remove_product', (req, res) => {
    const { product_id } = req.body;

    executeQuery("DELETE FROM products WHERE product_id=?", [product_id])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});

productRouter.patch('/edit_product', (req, res) => {
    const { name, media, price, color_list, size_list, product_summary, product_id } = req.body;

    executeQuery("UPDATE products SET name=?, media=?, price=?, color_list=?, size_list=?, product_summary=? WHERE product_id=?", [name, JSON.stringify(media), price, JSON.stringify(color_list), JSON.stringify(size_list), product_summary, product_id])
        .then(() => {
            executeQuery("UPDATE gearsmith.product_media SET product_name=? WHERE product_id=?", [name, product_id])
                .then((result) => {
                    return res.json(result);
                }).catch((error) => {
                    return res.json(error);
                });
        }).catch((error) => {
            return res.json(error);
        });
});


const storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, "upload/product/media/");
    },
    filename: function(req, file, callback) {
        callback(null, uuidV4() + ".jpg");
    }
});

const upload = multer({ storage: storage, limits: { fileSize: 1024 * 1024 * 300 } });

productRouter.post('/add_product_image', upload.single('image'), (req, res) => {
    const { product_name, product_id } = req.body;

    if (!req.file) {
        return res.json({
            message: "File Not Found!"
        });
    }

    executeQuery("INSERT INTO gearsmith.product_media (product_name, product_id, product_media.image_src) VALUES (?, ?, ?)", [product_name, product_id, req.file.filename])
        .then((result) => {
            return res.json({
                message: "File Uploaded Successfully",
                result: result
            });
        }).catch((error) => {
            return res.json(error);
        });
});

productRouter.get('/image', (req, res) => {
    executeQuery("SELECT * FROM product_media WHERE 1", [])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});

productRouter.get('/image/:product_name', (req, res) => {
    const { product_name } = req.params;
    executeQuery("SELECT CONCAT('upload/product/media/', image_src) as url FROM product_media WHERE product_name=?", [product_name])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});

productRouter.post('/fetch_media_into_product', (req, res) => {
    const { product_id } = req.body;

    executeQuery("SELECT image_src FROM product_media WHERE product_id=?", [product_id])
        .then((media_res) => {
            executeQuery("UPDATE products SET media=? WHERE product_id=?", [JSON.stringify(media_res), product_id])
                .then((result) => {
                    return res.json(result);
                }).catch((error) => {
                    return res.json(error);
                });
        }).catch((error) => {
            return res.json(error);
        });
});

export default productRouter;