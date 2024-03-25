import executeQuery from '../database/query.js';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt, { decode } from 'jsonwebtoken';

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

function getUserByEmail(email) {
    return new Promise((resolve, reject) => {
        executeQuery('SELECT * FROM user WHERE email = ?', [email])
            .then((result) => resolve(result))
            .catch((err) => reject(err));
    });
};

function createUser(email, password, meta, token) {
    console.log(token)
    return new Promise((resolve, reject) => {
        executeQuery('INSERT INTO user (email, password, meta, token) VALUES (?, ?, ?, ?)', [email, password, JSON.stringify(meta), token])
            .then((result) => resolve(result))
            .catch((error) => reject(error));
    });
};

function verifyToken(email, password) {
    return new Promise((resolve, reject) => {
        executeQuery("SELECT * FROM user WHERE email=? AND password=?", [email, password])
            .then((result) => resolve({ message: 'Authorized', result }))
            .catch((error) => reject(error));
    });
}

function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, 'my_key_1000', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.email = decoded.email;
        req.password = decoded.password;
        next();
    });
};

userRouter.get('/token/profile', authenticateToken, async(req, res) => {
    const isTokenVerified = await verifyToken(req.email, req.password);
    res.json(isTokenVerified);
});

userRouter.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ loginStatus: false, message: "Username and Password are Required" });
    }

    executeQuery("SELECT * FROM user WHERE email=?", [email])
        .then(async(result) => {
            if (result.length == 0) {
                return res.status(400).json({ loginStatus: false, message: 'No User Found with ' + email + ' Please Register' });
            }
            const passwordMatch = await bcrypt.compare(password, result[0].password);
            if (!passwordMatch) {
                return res.status(401).json({ loginStatus: false, message: 'Invalid Username and Password' });
            }

            const token = jwt.sign({ email: result[0].email, password: result[0].password }, 'my_key_1000', { expiresIn: '24h' });
            await executeQuery("UPDATE user SET token=? WHERE email=? AND password=?", [token, email, password])
                .then(() => {
                    res.status(200).json({ loginStatus: true, message: "Login Successful", token: token });
                }).catch((error) => {
                    console.log(error);
                    return res.json({ loginStatus: false, message: error });
                });
        }).catch((error) => {
            console.log(error)
            return res.json({ loginStatus: false, message: error });
        });
})

userRouter.post('/signin', async(req, res) => {
    const { email, password, meta } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Username and Password are Required" });
    }

    try {
        const existingEmail = await getUserByEmail(email);
        if (existingEmail.length > 0) {
            return res.status(400).json({ message: 'Username Already Exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const token = jwt.sign({ email: email, password: hashedPassword }, 'my_key_1000', { expiresIn: '24h' });
        const result = await createUser(email, hashedPassword, meta, token);

        res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
        console.error('Error registering user: ', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

userRouter.get('/email/:email', async(req, res) => {
    const { email } = req.params;
    const result = await getUserByEmail(email);
    res.status(200).json(result)
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