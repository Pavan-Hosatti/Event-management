require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');

const Feedback = require('./models/Feedback');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ ENSURE UPLOADS FOLDER EXISTS
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory');
}

// Ensure certificates subdirectory exists
const certificatesDir = path.join(uploadsDir, 'certificates');
if (!fs.existsSync(certificatesDir)) {
    fs.mkdirSync(certificatesDir, { recursive: true });
    console.log('✅ Created certificates directory');
}

// 🔧 DYNAMIC ML SERVICE URL
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';
console.log(`🤖 ML Service URL: ${ML_SERVICE_URL}`);

// 🔧 COMPREHENSIVE CORS CONFIGURATION
// Dynamically build allowed origins from FRONTEND_URL env var + known URLs
const buildAllowedOrigins = () => {
    const origins = [
        // Production Vercel URLs
        'https://event-hub-nine-neon.vercel.app',
        'https://event-lp1lw933e-pavan-hosattis-projects.vercel.app',
        // Local development
        'http://localhost:5173',
        'http://localhost:5175',
        'http://localhost:5174',
        'http://localhost:5001',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:5001',
    ];
    // Add any origins from FRONTEND_URL env var (comma-separated)
    if (process.env.FRONTEND_URL) {
        process.env.FRONTEND_URL.split(',').forEach(url => {
            const trimmed = url.trim();
            if (trimmed && !origins.includes(trimmed)) {
                origins.push(trimmed);
            }
        });
    }
    if (process.env.ML_SERVICE_URL) {
        origins.push(process.env.ML_SERVICE_URL);
    }
    return origins;
};
const allowedOrigins = buildAllowedOrigins();
console.log('🌐 Allowed CORS origins:', allowedOrigins);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`⚠️  CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400
};

// ✅ Middleware setup
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ ADD FILE UPLOAD MIDDLEWARE WITH FIX
app.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 },
    abortOnLimit: true,
    responseOnLimit: 'File size too large',
    createParentPath: true,
    useTempFiles: false,
    debug: false,
    safeFileNames: true,
    preserveExtension: true
}));

// ✅ Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ ROOT ROUTE
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Event Management Backend Running!',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        features: {
            fileUpload: true,
            certificates: true,
            qrCodes: true,
            feedback: true,
            documentRequests: true
        }
    });
});

// 👥 PUBLIC STATS - Import controller properly
const adminController = require('./controllers/adminController');
const { getPublicStats } = adminController || {};
if (getPublicStats) {
    app.get('/api/stats', getPublicStats);
} else {
    app.get('/api/stats', (req, res) => {
        res.json({
            success: true,
            message: 'Public stats endpoint',
            stats: {
                totalUsers: 0,
                totalEvents: 0,
                totalRegistrations: 0
            }
        });
    });
}

// 🔧 HEALTH CHECK ENDPOINT
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        uploadsDir: uploadsDir,
        certificatesDir: certificatesDir
    });
});

// 🔧 ML SERVICE HEALTH CHECK
app.get('/api/ml-status', async (req, res) => {
    try {
        const axios = require('axios');
        const response = await axios.get(`${ML_SERVICE_URL}/`, {
            timeout: 10000
        });
        res.json({ 
            success: true, 
            message: 'ML service is running',
            mlServiceUrl: ML_SERVICE_URL,
            mlStatus: response.data 
        });
    } catch (error) {
        console.error('❌ ML Service Error:', error.message);
        res.status(503).json({ 
            success: false, 
            message: 'ML service is not available',
            mlServiceUrl: ML_SERVICE_URL,
            error: error.message 
        });
    }
});


// Add this to your server.js to check uploads
app.get('/api/dev/uploads', (req, res) => {
  try {
    const files = fs.readdirSync(path.join(__dirname, 'uploads', 'certificates'));
    res.json({ 
      success: true, 
      count: files.length,
      files: files,
      path: path.join(__dirname, 'uploads', 'certificates')
    });
  } catch (err) {
    res.json({ 
      success: false, 
      message: err.message 
    });
  }
});

// ✅ Import and initialize auth middleware
const protect = (req, res, next) => {
    // Simple protection middleware - you should implement proper JWT validation
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token provided'
        });
    }
    
    // Here you should verify the JWT token
    // For now, we'll just add a user object to req
    req.user = { id: 'temp-user-id', role: 'admin' };
    next();
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to perform this action'
            });
        }
        
        next();
    };
};

// ✅ IMPORT ROUTES WITH ERROR HANDLING
let authRoutes, cropListingRoutes, bidRoutes, voiceRoutes, predictRoutes;

try {
    authRoutes = require('./routes/authRoutes');
    console.log('✅ Auth routes loaded');
} catch (err) {
    console.error('❌ Error loading auth routes:', err.message);
}

try {
    cropListingRoutes = require('./routes/cropListingRoutes');
    console.log('✅ Crop listing routes loaded');
} catch (err) {
    console.error('❌ Error loading crop listing routes:', err.message);
}

try {
    bidRoutes = require('./routes/bidRoutes');
    console.log('✅ Bid routes loaded');
} catch (err) {
    console.error('❌ Error loading bid routes:', err.message);
}

try {
    voiceRoutes = require('./routes/voiceRoutes');
    console.log('✅ Voice routes loaded');
} catch (err) {
    console.error('❌ Error loading voice routes:', err.message);
}

try {
    predictRoutes = require('./routes/predictRoutes');
    console.log('✅ Predict routes loaded');
} catch (err) {
    console.error('❌ Error loading predict routes:', err.message);
}

// 🔌 AI ROUTES
let aiRoutes;
try {
    aiRoutes = require('./routes/aiRoutes');
    console.log('✅ AI routes loaded');
} catch (err) {
    console.error('❌ Error loading AI routes:', err.message);
}

// 🔌 AI GRADER routes
let aiGraderRoutes;
try {
    aiGraderRoutes = require('./routes/aiGraderRouter');
    console.log('✅ AI Grader routes loaded');
} catch (err) {
    console.error('❌ Error loading AI Grader routes:', err.message);
}

// 🔌 ADMIN ROUTES
let adminRoutes;
try {
    adminRoutes = require('./routes/admin');
    console.log('✅ Admin routes loaded');
} catch (err) {
    console.error('❌ Error loading Admin routes:', err.message);
}

// 🔌 EVENTS ROUTES
let eventsRoutes;
try {
    eventsRoutes = require('./routes/eventsRoutes');
    console.log('✅ Events routes loaded');
} catch (err) {
    console.error('❌ Error loading events routes:', err.message);
}

// 🔌 STUDENT ROUTES
let studentRoutes;
try {
    studentRoutes = require('./routes/student');
    console.log('✅ Student routes loaded');
} catch (err) {
    console.error('❌ Error loading student routes:', err.message);
}

// 🔌 ADMIN EVENTS ROUTES
let adminEventsRoutes;
try {
    adminEventsRoutes = require('./routes/adminEvents');
    console.log('✅ Admin events routes loaded');
} catch (err) {
    console.error('❌ Error loading admin events routes:', err.message);
}

// 🔌 QR CODE ROUTES
let qrCodeRoutes;
try {
    qrCodeRoutes = require('./routes/qrCodes');
    console.log('✅ QR Code routes loaded');
} catch (err) {
    console.error('❌ Error loading QR Code routes:', err.message);
}

// ✅ MOUNT ROUTES
if (authRoutes) app.use('/api/auth', authRoutes);
if (adminRoutes) app.use('/api/admin', adminRoutes);
if (eventsRoutes) app.use('/api/events', eventsRoutes);
if (studentRoutes) app.use('/api/student', studentRoutes);
if (cropListingRoutes) app.use('/api/crops', cropListingRoutes);
if (bidRoutes) app.use('/api/bids', bidRoutes);
if (voiceRoutes) app.use('/api/voice', voiceRoutes);
if (predictRoutes) app.use('/api/predict', predictRoutes);
if (aiRoutes) app.use('/api/ai', aiRoutes);
if (aiGraderRoutes) app.use('/api/ai-grader', aiGraderRoutes);
if (adminEventsRoutes) app.use('/api/admin/events', adminEventsRoutes);
if (qrCodeRoutes) app.use('/api/qr-codes', qrCodeRoutes);

// ✅ ADD NOTIFICATION ROUTES HERE:
// Add these lines:
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);
console.log('🔔 Notification routes mounted at /api/student/notifications');



// ✅ TEMPORARY FALLBACK ROUTES (Remove after implementing)
app.get('/api/admin/attendance-history', (req, res) => {
    res.json({
        success: true,
        attendance: [
            { month: 'Sep', attendees: 320 },
            { month: 'Oct', attendees: 420 },
            { month: 'Nov', attendees: 410 },
            { month: 'Dec', attendees: 560 },
            { month: 'Jan', attendees: 480 }
        ]
    });
});

app.get('/api/admin/notifications', (req, res) => {
    res.json({
        success: true,
        notifications: [
            {
                id: '1',
                title: 'Welcome to Admin Dashboard',
                message: 'You can now manage events, attendance, and certificates',
                type: 'info',
                read: false,
                createdAt: new Date().toISOString()
            }
        ]
    });
});

// ✅ QR Code endpoint with proper imports
app.get('/api/qr-codes/event/:eventId', protect, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Dynamic imports to avoid requiring at top level if they don't exist
    const QRCode = require('qrcode');
    const Event = require('./models/Event');
    const Registration = require('./models/Registration');
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    const registrations = await Registration.find({ eventId });
    
    const qrCodes = [];
    for (const reg of registrations) {
      const qrData = {
        registrationId: reg._id.toString(),
        eventId,
        userId: reg.userId,
        studentName: reg.studentName
      };
      
      const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
      
      qrCodes.push({
        registrationId: reg._id,
        studentName: reg.studentName,
        email: reg.email,
        qrCode
      });
    }
    
    res.json({ success: true, qrCodes, count: qrCodes.length });
  } catch (err) {
    console.error('QR generation error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate QR codes' });
  }
});

// Add this route for event feedback (if you want a public route for events)
app.get('/api/events/:id/feedback', async (req, res) => {
  try {
    const feedback = await Feedback.find({ 
      eventId: req.params.id,
      anonymous: false // Only show non-anonymous feedback
    })
    .sort({ createdAt: -1 })
    .limit(50);
    
    res.json({
      success: true,
      feedback
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch feedback' });
  }
});


console.log('📋 Mounted routes:');
console.log('   - GET /');
console.log('   - GET /api/health');
console.log('   - GET /api/ml-status');
if (getPublicStats) console.log('   - GET /api/stats');
if (authRoutes) console.log('   - /api/auth/*');
if (adminRoutes) console.log('   - /api/admin/*');
if (eventsRoutes) console.log('   - /api/events/*');
if (studentRoutes) console.log('   - /api/student/*');
if (aiRoutes) console.log('   - /api/ai/*');
if (cropListingRoutes) console.log('   - /api/crops/*');
if (bidRoutes) console.log('   - /api/bids/*');
if (voiceRoutes) console.log('   - /api/voice/*');
if (predictRoutes) console.log('   - /api/predict/*');
if (aiGraderRoutes) console.log('   - /api/ai-grader/*');
if (adminEventsRoutes) console.log('   - /api/admin/events/*');
if (qrCodeRoutes) console.log('   - /api/qr-codes/*');

// ✅ CONNECT TO DATABASE
if (!process.env.MONGO_URI) {
    console.warn('⚠️ MONGO_URI is not set. Database connection skipped. Set MONGO_URI in backend/.env to enable DB.');
} else {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log('✅ MongoDB Connected Successfully');
            
            setTimeout(() => {
                const modelNames = mongoose.modelNames();
                console.log('📊 Registered Mongoose Models:', modelNames);
            }, 1000);
        })
        .catch(err => {
            console.error('❌ MongoDB Connection Error:', err.message);
        });
}

// ✅ DEV: Expose developer-only routes when not in production
if (process.env.NODE_ENV !== 'production') {
    try {
        // Dynamically require User model if it exists
        const User = require('./models/User');
        app.get('/api/dev/users', async (req, res) => {
            try {
                const users = await User.find().select('-password');
                return res.json({ success: true, count: users.length, data: users });
            } catch (err) {
                return res.status(500).json({ success: false, message: 'Could not fetch users', error: err.message });
            }
        });
        console.log('🔧 Dev route enabled: GET /api/dev/users');
        
        app.get('/api/dev/uploads', (req, res) => {
            try {
                const files = fs.readdirSync(certificatesDir);
                return res.json({ 
                    success: true, 
                    count: files.length,
                    files: files.slice(0, 20),
                    totalSize: files.reduce((total, file) => {
                        try {
                            const stats = fs.statSync(path.join(certificatesDir, file));
                            return total + stats.size;
                        } catch {
                            return total;
                        }
                    }, 0) / 1024 / 1024
                });
            } catch (err) {
                return res.json({ 
                    success: false, 
                    message: 'Could not read uploads directory',
                    error: err.message 
                });
            }
        });
        console.log('🔧 Dev route enabled: GET /api/dev/uploads');
        
        app.post('/api/dev/test-upload', (req, res) => {
            if (!req.files || !req.files.file) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'No file uploaded',
                    tip: 'Use form-data with "file" field'
                });
            }
            
            const file = req.files.file;
            const fileName = `test-${Date.now()}-${file.name}`;
            const filePath = path.join(certificatesDir, fileName);
            
            file.mv(filePath, (err) => {
                if (err) {
                    return res.status(500).json({ 
                        success: false, 
                        message: 'File upload failed',
                        error: err.message 
                    });
                }
                
                res.json({
                    success: true,
                    message: 'File uploaded successfully',
                    file: {
                        name: fileName,
                        size: file.size,
                        mimetype: file.mimetype,
                        path: `/uploads/certificates/${fileName}`
                    }
                });
            });
        });
        console.log('🔧 Dev route enabled: POST /api/dev/test-upload');
        
    } catch (err) {
        console.warn('⚠️ Dev routes not available:', err.message);
    }
}

// ✅ 404 HANDLER
app.use((req, res, next) => {
    console.log(`⚠️  404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.url}`,
        requestedUrl: req.url,
        method: req.method,
        availableRoutes: [
            'GET /',
            'GET /api/health',
            'GET /api/ml-status',
            'GET /api/stats',
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET /api/admin/stats',
            'GET /api/admin/attendance-history',
            'GET /api/admin/notifications',
            'GET /api/student/dashboard',
            'GET /api/dev/users (dev only)',
            'POST /api/dev/test-upload (dev only)'
        ]
    });
});

// ✅ ERROR HANDLER
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            message: 'CORS Error: Origin not allowed',
            error: err.message,
            allowedOrigins: allowedOrigins
        });
    }
    
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            success: false,
            message: 'File too large. Maximum size is 10MB',
            error: err.message
        });
    }
    
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
    });
});

// ✅ START SERVER
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Serving uploads from: ${uploadsDir}`);
    console.log(`📄 Certificates directory: ${certificatesDir}`);
    console.log(`🤖 ML Service URL: ${ML_SERVICE_URL}`);
    console.log(`📦 File upload enabled: Yes (10MB limit)`);
    console.log(`🚀 Server ready to handle requests!`);
});