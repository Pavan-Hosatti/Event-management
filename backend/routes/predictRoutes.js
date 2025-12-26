// routes/predictRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Multer configuration for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Import your prediction controller (create this if you don't have it)
const predictController = require('../controllers/predictController');

// GET /api/predict/examples - Return mock examples for frontend previews
router.get('/examples', predictController.getExamples);

// POST /api/predict - Predict crop grade from image
router.post('/', upload.single('image'), predictController.predictGrade);

module.exports = router;
