const Razorpay = require('razorpay');
const express = require("express");
const { v4 } = require('uuid');
const crypto = require('crypto');
const executeQuery = require('../database/query.js');

const orderRouter = express.Router();

var razorpay = new Razorpay({
    key_id: 'rzp_live_rs6UWRJ2Auh5hC',
    key_secret: 'X1bC8RNgGZ97W6YYMBu5u5pz'
});

function verifySignature(signature, secret, payload) {
    const generatedSignature = crypto.createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
    return signature === generatedSignature;
}

orderRouter.get('/user/:token', (req, res) => {
    const { token } = req.params;
    executeQuery("SELECT user_id FROM user WHERE token=?", [token])
        .then((user_res) => {
            executeQuery("SELECT * FROM all_order WHERE user_id=? ORDER BY timestamp DESC", [user_res[0].user_id])
                .then((order_res) => {
                    res.json(order_res);
                }).catch((err) => {
                    return res.status(500).json(err);
                });
        }).catch((err) => {
            return res.status(500).json(err);
        });
});

orderRouter.post('/create_order', async(req, res) => {
    const { userToken, user_address } = req.body;
    var receipt = v4();
    await executeQuery("SELECT user_id, meta FROM user WHERE token=?", [userToken])
        .then(async(user_res) => {
            await executeQuery("SELECT SUM(price * quantity) AS total_cost, CONCAT('[', GROUP_CONCAT(JSON_OBJECT('product_id', product_id, 'quantity', quantity, 'price', price)), ']') AS product_list FROM user_cart WHERE user_id=?", [user_res[0].user_id])
                .then(async(user_cart_res) => {
                    if (user_cart_res[0].total_cost < 1) {
                        return res.status(500).json({ message: "Failed to make order" });
                    }
                    const options = {
                        amount: user_cart_res[0].total_cost * 100,
                        currency: 'INR',
                        receipt: receipt,
                    };
                    try {
                        var order = await razorpay.orders.create(options);
                    } catch (error) {
                        console.error(error, user_cart_res.total_cost * 100);
                        return res.status(500).json({ message: "Failed to make order" });
                    };
                    executeQuery("INSERT INTO all_order (product_list, user_id, order_id, total_cost, user_address, user_meta) VALUES (?, ?, ?, ?, ?, ?)", [user_cart_res[0].product_list, user_res[0].user_id, order.id, user_cart_res[0].total_cost, user_address, user_res[0].meta])
                        .then((order_res) => {
                            return res.status(200).json(order)
                        }).catch((err) => {
                            return res.status(500).json(err)
                        })
                }).catch((err) => {
                    return res.status(500).json(err)
                })
        }).catch((err) => {
            return res.status(500).json(err)
        })
});

orderRouter.post('/capture_payment', async(req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userToken, orderCreationId } = req.body;
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;

    try {
        const isSignatureValid = verifySignature(razorpay_signature, 'X1bC8RNgGZ97W6YYMBu5u5pz', payload);
        if (isSignatureValid) {
            executeQuery("SELECT user_id FROM user WHERE token=?", [userToken])
                .then((user_res) => {
                    executeQuery("UPDATE all_order SET is_conform=?, razorpay_order_id=?, razorpay_payment_id=? WHERE order_id=? AND user_id=?", [1, razorpay_order_id, razorpay_payment_id, orderCreationId, user_res[0].user_id])
                        .then(() => {
                            return res.json({ status: true, message: "Payment Successful" });
                        }).then(() => {
                            executeQuery("DELETE FROM user_cart WHERE user_id=?", [user_res[0].user_id]);
                        }).catch((err) => {
                            console.log(err)
                            return res.status(400).json({ status: false, message: "Payment Failed" + err });
                        })
                }).catch((err) => {
                    console.log(err)
                    return res.status(400).json({ status: false, message: "Payment Failed" + err });
                })
        } else {
            return res.status(400).json({ status: false, message: "Payment Failed" });
        };
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Payment Failed" });
    };
});

orderRouter.get('/checkout/', (req, res) => {
    const { token } = req.query;
    executeQuery("SELECT user_id FROM user WHERE token=?", [token])
        .then((user_res) => {
            executeQuery("SELECT product_id, quantity, size, color, price FROM user_cart WHERE user_id=?", [user_res[0].user_id])
                .then((user_cart_res) => {
                    return res.json(user_cart_res.map((product) => {
                        const total = product.price * product.quantity
                        return { price: product.price, size: product.size, color: product.color, quantity: product.quantity, total: total, product_id: product.product_id }
                    }));
                }).catch((error) => {
                    return res.json(error);
                });
        }).catch((error) => {
            return res.json(error);
        });
});

export default orderRouter;