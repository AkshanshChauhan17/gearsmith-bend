import express from 'express';
import cors from 'cors';

import userRouter from './routes/user.js';
import navigationRouter from './routes/navigation.js';
import productRouter from './routes/product.js';
import mediaRouter from './routes/media.js';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import reviewRouter from './routes/review.js';

var api = express();

const __dirname = dirname(fileURLToPath(
    import.meta.url));

api.use('/static', express.static(path.join(__dirname, 'upload')));

api.use(express.urlencoded({ extended: true }));
api.use(express.json({ limit: "500mb" }));
api.use(cors());

api.use('/user', userRouter);
api.use('/navigation', navigationRouter);
api.use('/product', productRouter);
api.use('/media', mediaRouter);
api.use('/review', reviewRouter);

api.listen(1000, () => {
    console.log('Server Started At 1000');
});