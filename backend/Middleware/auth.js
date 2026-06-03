const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_TOKEN || 'default_jwt_secret';

const ensureAuthenticated = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ 
            message: "Unauthorized: JWT token is required", 
            success: false 
        });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (err) {
        return res.status(401).json({ 
            message: "Unauthorized: invalid or expired token", 
            success: false 
        });
    }
};

module.exports = ensureAuthenticated;