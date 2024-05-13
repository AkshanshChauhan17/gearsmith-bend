const express = require("express");
const sharp = require("sharp");
const fs = require("fs");

const mediaRouter = express.Router();

mediaRouter.get('/image/user/:email', (req, res) => {
    const { email } = req.params;
    const { width, height } = req.query;

    const image = sharp(`upload/user/media/${email}/profile_image.jpg`);

    if (width && height) {
        image.resize(Number(width), Number(height));
    }
    res.set('Content-Type', 'image/jpeg');

    image.pipe(res);
});

mediaRouter.get('/image/product/:product_id/:number', (req, res) => {
    const { product_id, number } = req.params;
    const { r } = req.query;

    const image = sharp(`upload/product/media/${product_id}/product_image_${number}.jpg`);

    if (r) {
        image.resize(Number(r), null);
    }
    res.set('Content-Type', 'image/jpeg');

    image.pipe(res);
});

module.exports = mediaRouter;