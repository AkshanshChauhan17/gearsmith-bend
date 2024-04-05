import executeQuery from "../database/query.js";
import express from "express";
import { v4 as uuidV4 } from "uuid";
import multer from "multer";

const productRouter = express.Router();

productRouter.get('/', async(req, res) => {
    const page = req.query.page || 1;
    const page_size = 10;
    const offset = (page - 1) * page_size;
    executeQuery("SELECT * FROM product").then((total) => {
        executeQuery("SELECT * FROM product WHERE 1 LIMIT ?, ? ", [offset, page_size])
            .then((result) => {
                return res.json({ data: result, total: Math.round(total.length / page_size) });
            }).catch((error) => {
                return res.json(error);
            });
    }).catch((error) => {
        return res.json(error);
    });
});

productRouter.get('/new_arrive', (req, res) => {
    executeQuery("SELECT * FROM product ORDER BY id DESC LIMIT 5", [])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});

productRouter.get('/:product_id', (req, res) => {
    const { product_id } = req.params;
    executeQuery("SELECT * FROM product WHERE product_id=?", [product_id])
        .then((result) => {
            return res.json(...result);
        }).catch((error) => {
            return res.json(error);
        });
});

productRouter.get('/get_from_cart/:email', (req, res) => {
    const { email } = req.params;
    executeQuery("SELECT user_id FROM user WHERE email=?", [email])
        .then((user_res) => {
            executeQuery("SELECT product_id, quantity, size, color, price FROM user_cart WHERE user_id=?", [user_res[0].user_id])
                .then((user_cart_res) => {
                    return res.json(user_cart_res);
                }).catch((error) => {
                    return res.json(error);
                });
        }).catch((error) => {
            return res.json(error);
        });
})

productRouter.post('/add_to_cart', (req, res) => {
    const { email, product_id, quantity, size, color, product_price } = req.body;
    executeQuery("SELECT user_id FROM user WHERE email=?", [email])
        .then((user_res) => {
            console.log(user_res)
            executeQuery("INSERT INTO user_cart (user_id, product_id, quantity, size, color, price) VALUES (?, ?, ?, ?, ?, ?)", [user_res[0].user_id, product_id, quantity, size, color, product_price])
                .then((result) => {
                    return res.json(result);
                }).catch((error) => {
                    return res.json(error);
                });
        }).catch((error) => {
            return res.json(error);
        });
});

productRouter.delete('/remove_from_cart', (req, res) => {
    const { email, product_id } = req.body;
    executeQuery("SELECT user_id FROM user WHERE email=?", [email])
        .then((user_res) => {
            executeQuery("DELETE FROM user_cart WHERE user_id=? AND product_id=?", [user_res[0].user_id, product_id])
                .then((result) => {
                    return res.json(result);
                }).catch((error) => {
                    return res.json(error);
                });
        }).catch((error) => {
            return res.json(error);
        });
});

productRouter.post('/add_product', (req, res) => {
    const product_id = uuidV4();
    const { name, media, price, color_list, size_list, product_summary } = req.body;

    executeQuery("INSERT INTO product (name, media, price, product_id, color_list, size_list, product_summary) VALUES (?, ?, ?, ?, ?, ?, ?)", [name, JSON.stringify(media), price, product_id, JSON.stringify(color_list), JSON.stringify(size_list), product_summary])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});

productRouter.delete('/remove_product', (req, res) => {
    const { product_id } = req.body;

    executeQuery("DELETE FROM product WHERE product_id=?", [product_id])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});

productRouter.patch('/edit_product', (req, res) => {
    const { name, media, price, color_list, size_list, product_summary, product_id } = req.body;

    executeQuery("UPDATE product SET name=?, media=?, price=?, color_list=?, size_list=?, product_summary=? WHERE product_id=?", [name, JSON.stringify(media), price, JSON.stringify(color_list), JSON.stringify(size_list), product_summary, product_id])
        .then(() => {
            executeQuery("UPDATE product_media SET product_name=? WHERE product_id=?", [name, product_id])
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

    executeQuery("INSERT INTO product_media (product_name, product_id, image_src) VALUES (?, ?, ?)", [product_name, product_id, req.file.filename])
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

// productRouter.get('/image/:product_name', (req, res) => {
//     const { product_name } = req.params;
//     executeQuery("SELECT CONCAT('upload/product/media/', image_src) as url FROM product_media WHERE product_name=?", [product_name])
//         .then((result) => {
//             return res.json(result);
//         }).catch((error) => {
//             return res.json(error);
//         });
// });

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
            executeQuery("UPDATE product SET media=? WHERE product_id=?", [JSON.stringify(media_res), product_id])
                .then((result) => {
                    return res.json(result);
                }).catch((error) => {
                    return res.json(error);
                });
        }).catch((error) => {
            return res.json(error);
        });
});

productRouter.post('/rate', (req, res) => {
    const { rating, user_email, comment, product_id, image } = req.body;
    executeQuery("INSERT INTO product_rating (rating, user_email, comment, product_id, rating_image) VALUES (?, ?, ?, ?, ?)", [rating, user_email, comment, product_id, image])
        .then((result) => {
            return res.json(result)
        }).catch((error) => {
            return res.json(error);
        });
});

productRouter.get('/rate/:product_id', (req, res) => {
    const { product_id } = req.params;
    executeQuery("SELECT * FROM product_rating WHERE product_id=?", [product_id])
        .then((result) => {
            return res.json(result)
        }).catch((error) => {
            return res.json(error);
        });
});

productRouter.get('/rate/percentage/:product_id', (req, res) => {
    const { product_id } = req.params;
    executeQuery("SELECT * FROM product_rating WHERE product_id=?", [product_id])
        .then((result) => {
            const ratingCounts = {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0
            };

            result.forEach((r, i) => {
                ratingCounts[r.rating]++;
            });

            const totalRatings = result.length;

            const newRatingPercentage = {
                five_star: Math.round((ratingCounts["5"] / totalRatings) * 100),
                four_star: Math.round((ratingCounts["4"] / totalRatings) * 100),
                three_star: Math.round((ratingCounts["3"] / totalRatings) * 100),
                two_star: Math.round((ratingCounts["2"] / totalRatings) * 100),
                one_star: Math.round((ratingCounts["1"] / totalRatings) * 100)
            };

            res.json(newRatingPercentage);
        })
        .catch((error) => {
            console.error("Error fetching ratings:", error);
            res.status(500).json({ error: "Internal Server Error" });
        });
});

export default productRouter;