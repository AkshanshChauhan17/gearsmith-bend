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

api.use('/static', express.static(path.join(__dirname, 'upload')));

api.use(express.urlencoded({ extended: true }));
api.use(express.json({ limit: "500mb" }));
api.use(cors());

api.use('/api/user', userRouter);
api.use('/api/navigation', navigationRouter);
api.use('/api/product', productRouter);
api.use('/api/media', mediaRouter);
api.use('/api/review', reviewRouter);
api.use('/api/order', orderRouter);
api.use('/api/admin', adminRouter);

api.listen();