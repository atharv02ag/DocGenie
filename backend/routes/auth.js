const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const express = require('express');
const users = require('../models/userModel.js');
require('dotenv').config();

const router = express.Router();

const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'postmessage',
);

router.use(express.json());

router.post('/', async (req, res) => {
    try {
        const { tokens } = await oAuth2Client.getToken(req.body.code);
        const { id_token } = tokens;
        const payload = jwt.decode(id_token);

        const sessionToken = jwt.sign({
            email: payload.email,
            name: payload.name,
            sub: payload.sub,
        }, process.env.JWT_SECRET_KEY, { expiresIn: '24h' });

        const user = await users.findOne({ googleId: payload.sub });

        console.log(user);

        if (!user) {
            const newUser = await users.create({
                googleId: payload.sub,
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
            });
            console.log('new user created!');
        }

        const returnObject = {
            sessionToken: sessionToken,
            username: payload.name,
            picture: payload.picture,
        }
        res.json(returnObject);
    }
    catch (err) {
        console.log(err);
        res.status(400).send('Error Logging in with Google');
    }
});

module.exports = router;