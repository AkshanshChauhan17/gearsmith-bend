import Razorpay from 'razorpay';
import express from 'express';
import { v4 } from 'uuid';
import crypto from 'crypto';

const orderRouter = express.Router();

var razorpay = new Razorpay({
    key_id: 'rzp_test_cWx0FiWY7TRc5L',
    key_secret: 'gN0nw15ZrNyfFIS7L2NrcQbm'
});

function verifySignature(signature, secret, payload) {
    const generatedSignature = crypto.createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
    return signature === generatedSignature;
}

orderRouter.post('/create_order', async(req, res) => {
    var receipt = v4();

    const options = {
        amount: 1000,
        currency: 'INR',
        receipt: receipt
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to make order" });
    };
});

orderRouter.post('/capture_payment', async(req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;

    try {
        const isSignatureValid = verifySignature(razorpay_signature, 'gN0nw15ZrNyfFIS7L2NrcQbm', payload);
        if (isSignatureValid) {
            res.json({ message: "Payment Successful" });
        } else {
            return res.status(400).json({ message: "Payment Failed" });
        };
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to make order" });
    };
});

orderRouter.get('/checkout_data/:token', (req, res) => {
    const { token } = req.params;
    executeQuery("SELECT user_email FROM user WHERE token=?", [token])
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
});

export default orderRouter;