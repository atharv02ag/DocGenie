import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

export default function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];

    //session token sent as header authorization : bearer <token>
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({
        error: 'Session missing',
        action: 'REAUTHENTICATE',
    });

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    error: 'Session expired',
                    action: 'REAUTHENTICATE',
                });
            }
            return res.status(403).json({
                error: 'Invalid token',
                action: 'REAUTHENTICATE',
            });
        }
        req.user = decoded;
        next();
    });
}