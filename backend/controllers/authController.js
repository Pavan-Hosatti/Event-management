const User = require('../models/User'); // Ensure your model is named User or update accordingly
const https = require('https');

/**
 * @desc    Helper to send JWT in cookie and response body
 */
const sendAuthResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const cookieOptions = {
        expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    };

    res.status(statusCode)
        .cookie('token', token, cookieOptions)
        .json({
            success: true,
            token, 
            user: { 
                id: user._id,
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role, // Returns 'student' or 'organizer'
                avatar: user.name.charAt(0).toUpperCase()
            }
        });
};

// @desc    Register a new User (Student or Organizer)
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists.' });
        }

        const user = await User.create({
            name,
            email,
            password,
            phone: phone || '',
            role: role || 'student' // Dynamic role from frontend
        });

        sendAuthResponse(user, 201, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Registration failed.' });
    }
};

// @desc    Login User
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password.' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        sendAuthResponse(user, 200, res);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Login failed.' });
    }
};

// @desc    Google OAuth Login
// @route   POST /api/auth/google-login
exports.googleLogin = async (req, res) => {
    try {
        const { token, role } = req.body; 

        const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`;

        https.get(verifyUrl, (apiRes) => {
            let data = '';
            apiRes.on('data', chunk => data += chunk);
            apiRes.on('end', async () => {
                const googleUser = JSON.parse(data);
                if (googleUser.error) return res.status(401).json({ success: false, message: 'Invalid Google token.' });

                let user = await User.findOne({ email: googleUser.email });

                if (!user) {
                    user = await User.create({
                        name: googleUser.name,
                        email: googleUser.email,
                        password: 'google-oauth-' + Math.random().toString(36),
                        role: role || 'student',
                        phone: ''
                    });
                }
                sendAuthResponse(user, 200, res);
            });
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Google login failed.' });
    }
};

// @desc    Get current user data
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
};

// @desc    Logout / Clear Cookie
// @route   GET /api/auth/logout
exports.logout = (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }).status(200).json({ success: true, message: 'Logged out.' });
};