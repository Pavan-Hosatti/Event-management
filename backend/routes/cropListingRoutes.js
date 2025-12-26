const express = require('express');
const cropListingController = require('../controllers/cropListingController');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// --- Multer Configuration ---
// Destination: 'uploads/' directory inside the backend folder
// Filename: Use the current timestamp to ensure uniqueness
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // You MUST ensure this 'uploads/' directory exists in your backend root
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
// ----------------------------

// Farmer Submission Route (Handles file upload)
// 🛑 UPDATED: Field name changed from 'cropFile' to 'video' to match the frontend (AIGrader.jsx)
router.post('/submit-for-grading', upload.single('video'), cropListingController.submitForGrading); 


router.post('/crops/ml-webhook', cropListingController.updateGradeFromML);

// 🆕 NEW ASYNC ROUTE: Check the status of an ML grading job
// This route will be called repeatedly by the frontend (polling).
// It maps to the new controller function you implemented: checkGradingStatus
router.get('/grading-status/:jobId', cropListingController.checkGradingStatus);
router.post('/crops/ml-webhook', cropListingController.updateGradeFromML);

// Existing Routes
// Public marketplace alias for compatibility with older frontends
router.get('/marketplace', cropListingController.getAllCrops);
router.get('/all', cropListingController.getAllCrops);
router.get('/farmer/:farmerId', cropListingController.getFarmersListings); 
router.get('/:id', cropListingController.getCropById);

module.exports = router;
