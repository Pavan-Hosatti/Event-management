const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ PROTECT: Verify token and attach user to req.user
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Priority 1: Check Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('🔑 Token from Authorization header');
    }
    // Priority 2: Check cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('🔑 Token from cookies');
    }

    if (!token) {
      console.log('❌ No token found in request');
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please login.'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token verified for user:', decoded.id);
      
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        console.log('❌ User not found in database');
        return res.status(401).json({
          success: false,
          message: 'User no longer exists.'
        });
      }

      console.log('✅ User authenticated:', req.user.email, 'Role:', req.user.role);
      next();
      
    } catch (err) {
      console.log('❌ Token verification failed:', err.message);
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired. Please login again.'
      });
    }
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Authentication error'
    });
  }
};

// ✅ AUTHORIZE: Restrict access to specific roles
// NOW CASE-INSENSITIVE
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('❌ No user in request');
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Convert all roles to lowercase for comparison
    const normalizedRoles = roles.map(r => r.toLowerCase());
    const userRole = (req.user.role || '').toLowerCase();

    console.log('🔒 Authorization check:', {
      userRole,
      allowedRoles: normalizedRoles,
      matches: normalizedRoles.includes(userRole)
    });

    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`
      });
    }

    console.log('✅ Authorization passed');
    next();
  };
};