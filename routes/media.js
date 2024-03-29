import express from "express";
import sharp from "sharp";
import fs from "fs";

const mediaRouter = express.Router();


async function resizeImageToBase64(imagePath, width, height) {
    const imageBuffer = fs.readFileSync(imagePath);
    const resizedImageBuffer = await sharp(imageBuffer)
        .resize(width, height)
        .toBuffer();
    return resizedImageBuffer.toString('base64');
}

mediaRouter.get('/image', async(req, res) => {
    const { image_path } = req.query;
    try {
        const resolutions = [
            { width: 100, height: 100 },
            { width: 500, height: 500 },
            { width: 1000, height: 1000 }
        ];

        const resizedImagesBase64 = await Promise.all(resolutions.map(async(resolution) => {
            const base64Image = await resizeImageToBase64(image_path, resolution.width, resolution.height);
            return { resolution: `${resolution.width}x${resolution.height}`, base64: "data:image/jpeg;base64," + base64Image };
        }));

        res.json({ images: resizedImagesBase64 });
    } catch (error) {
        console.error('Error processing image request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default mediaRouter;