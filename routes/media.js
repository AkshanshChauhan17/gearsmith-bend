const express = require("express");
const sharp = require("sharp");
const fs = require("fs").promises; // Using promises version of fs for async operations

const mediaRouter = express.Router();

mediaRouter.get('/image/user/:email', async(req, res) => {
    const { email } = req.params;
    const { r } = req.query;

    try {
        const imagePath = `upload/user/media/${email}/profile_image.jpg`;
        await fs.access(imagePath); // Check if the file exists
        const image = sharp(imagePath);
        if (r && r <= 2000) {
            image.resize(Number(r), null);
        }
        res.set('Content-Type', 'image/jpeg');
        image.pipe(res);
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(404).send("Image not found");
    }
});

mediaRouter.get('/image/product/:product_id/:number', async(req, res) => {
    const { product_id, number } = req.params;
    const { r } = req.query;

    try {
        const imagePath = `upload/product/media/${product_id}/product_image_${number}.jpg`;
        await fs.access(imagePath); // Check if the file exists
        const image = sharp(imagePath);
        if (r && r <= 2000) {
            image.resize(Number(r), null);
        }
        res.set('Content-Type', 'image/jpeg');
        image.pipe(res);
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(404).send("Image not found");
    }
});

module.exports = mediaRouter;