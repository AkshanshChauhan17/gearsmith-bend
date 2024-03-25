import executeQuery from '../database/query.js';
import express from 'express';

const userRouter = express.Router();

userRouter.get('/', (req, res) => {
    executeQuery("SELECT * FROM user WHERE 1", [])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});

// --------------- This is Authentication section --------------- 

userRouter.get('/:email', (req, res) => {
    const { email } = req.params;
    executeQuery("SELECT * FROM user WHERE id=?", [email])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});

userRouter.get('/add/:email/:password', (req, res) => {
    const { email, password } = req.params;
    executeQuery("INSERT INTO user (email, password, meta) VALUES (?, ?, ?)", [email, password, JSON.stringify({ name: "xyz", phone: 101000100100, address: "rox/park" })])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});


userRouter.get('/verify/:email/:password', (req, res) => {
    const { email, password } = req.params;
    executeQuery("SELECT * FROM user WHERE email=? AND password=?", [email, password])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});

// --------------- This is Cart section --------------- 

userRouter.post('/cart', (req, res) => {
    const { email } = req.body;

    executeQuery("SELECT * FROM user_cart WHERE email=?", [email])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});


userRouter.post('/add_to_cart', (req, res) => {
    const { product_id, email, quantity } = req.body;

    executeQuery("INSERT INTO user_cart (email, product_id, quantity) VALUES (?, ?, ?)", [email, product_id, quantity])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});

userRouter.delete('/remove_from_cart', (req, res) => {
    const { product_id, email } = req.body;

    executeQuery("DELETE FROM user_cart WHERE email=? AND product_id=?", [email, product_id])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});

userRouter.delete('/remove_all_from_cart', (req, res) => {
    executeQuery("DELETE FROM user_cart WHERE 1", [])
        .then((result) => {
            return res.json(result);
        }).catch((error) => {
            return res.json(error);
        });
});


export default userRouter;