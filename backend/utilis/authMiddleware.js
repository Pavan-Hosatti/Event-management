// utils/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Use User model for authentication

// Protect routes by verifying the JWT
exports.protect = async (req, res, next) => {
    let token;

    // 1. Check for token in cookies (preferred for HTTP-only)
    if (req.cookies.token) {
        token = req.cookies.token;
    } 
    // OR check for token in the Authorization header (less secure, but a fallback)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // 2. Make sure token exists
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route. Missing token.' });
    }

    try {
        // 3. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Attach the user object (excluding the password) to the request
        // This makes user data (like ID and role) available in your controllers
        req.user = await User.findById(decoded.id).select('-password');

        // 5. Proceed to the next middleware/controller
        next();

    } catch (err) {
        console.error(err);
        return res.status(401).json({ success: false, message: 'Not authorized to access this route. Invalid token.' });
    }
};

// Role-based authorization helper
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'User role not authorized to access this route' });
        }
        next();
    };
};