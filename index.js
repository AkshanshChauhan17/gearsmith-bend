const express = require('express');
const cors = require('cors');

const userRouter = require('./routes/user.js');
const navigationRouter = require('./routes/navigation.js');
const productRouter = require('./routes/product.js');
const mediaRouter = require('./routes/media.js');
const path = require('path');
const { dirname } = require('path');
const { fileURLToPath } = require('url');
const reviewRouter = require('./routes/review.js');
const orderRouter = require('./routes/order.js');
const adminRouter = require('./routes/admin.js');

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
api.use('/order', orderRouter);
api.use('/admin', adminRouter);

api.listen();