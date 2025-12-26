const CropListing = require('../models/CropListing');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// ML Service URL
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';
console.log('🔍 ML_SERVICE_URL:', ML_SERVICE_URL);
// Fixed version of submitForGrading
exports.submitForGrading = async (req, res) => {
    console.log('\n🟢 ===== ASYNC JOB SUBMISSION STARTED =====');
    console.log('Timestamp:', new Date().toISOString());

    console.log('🔍 ML_SERVICE_URL from env:', process.env.ML_SERVICE_URL);
    console.log('🔍 ML_SERVICE_URL constant:', ML_SERVICE_URL);

    try {
        if (!req.file) {
            console.log('❌ VALIDATION FAILED: No file in request');
            return res.status(400).json({ 
                success: false, 
                message: 'Crop video file is required.',
                debug: 'req.file is undefined - check multer configuration'
            });
        }
        
        const { farmerId, crop, quantityKg, pricePerKg, location, details, marketChoice } = req.body;
        const videoPath = req.file.path;

        if (!fs.existsSync(videoPath)) {
            console.log('❌ FILE NOT FOUND ON DISK');
            return res.status(400).json({
                success: false,
                message: 'Uploaded video file not found on server',
                debug: { videoPath, exists: false }
            });
        }

        console.log('📊 File info:', {
            size: req.file.size,
            mimetype: req.file.mimetype,
            path: videoPath
        });

        // 4. PREPARE ML REQUEST
        console.log('\n🔄 ===== SUBMITTING JOB TO ML SERVICE (ASYNC) =====');
        
        let job_id = null;
try {
    // Create form data
    const formData = new FormData();
    const fileStream = fs.createReadStream(path.resolve(videoPath));
    
    formData.append('video', fileStream, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
    });
    formData.append('cropType', (crop || '').toLowerCase());


            const mlUrl = `${ML_SERVICE_URL}/api/ml/submit`; 
            
            console.log('📤 ML Job Submission URL:', mlUrl);
          console.log('📦 Uploading file:', req.file.originalname); 

            // 🔧 FIX 2: Increased timeout and better error handling
            console.log('⏳ Sending job submission request to ML service...');
            
   const mlResponse = await axios.post(mlUrl, formData, {
    headers: {
        ...formData.getHeaders()
    },
    timeout: 30000, 
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    validateStatus: (status) => status < 500
});
            
            // 6. PROCESS ASYNC ML RESPONSE
            if (mlResponse.status === 202 && mlResponse.data.job_id) {
                job_id = mlResponse.data.job_id;
                console.log(`\n✅ Job successfully submitted. Job ID: ${job_id}`);
            } else {
                console.warn('⚠️ ML service response:', mlResponse.status, mlResponse.data);
                throw new Error(`ML submission failed: ${JSON.stringify(mlResponse.data)}`);
            }
            
        } catch (mlError) {
            console.error('\n❌❌❌ ML SUBMISSION ERROR ❌❌❌');
            console.error('Error Message:', mlError.message);
            console.error('Error Code:', mlError.code);
            
            if (mlError.code === 'ECONNABORTED') {
                console.error('🕐 Request timeout - file too large or slow connection');
            } else if (mlError.code === 'ECONNREFUSED') {
                console.error('🔌 ML service is not running or not accessible');
            }
        }
        
        // 8. SAVE TO DATABASE
        console.log('\n💾 ===== SAVING TO DATABASE =====');
        
        const statusToSave = job_id ? 'pending_grading' : 'failed_submission';
        
        const newCrop = new CropListing({
            farmerId,
            crop,
            quantityKg: Number(quantityKg),
            pricePerKg: Number(pricePerKg),
            location,
            details,
            marketChoice,
            videoUrl: videoPath,
            status: statusToSave,
            mlJobId: job_id, 
            grade: 'Pending', 
            qualityScore: 0,
            gradeDetails: {}
        });
        
        const savedCrop = await newCrop.save();
        console.log('✅ Saved to database with ID:', savedCrop._id);
        
        // 🔧 FIX 4: Clean up temp file AFTER successful upload
        // Only delete if ML submission was successful
        if (job_id) {
            setTimeout(() => {
                try {
                    if (fs.existsSync(videoPath)) {
                        fs.unlinkSync(videoPath);
                        console.log('🗑️ Cleaned up temp file after successful submission');
                    }
                } catch (cleanupError) {
                    console.error('⚠️ Cleanup error:', cleanupError.message);
                }
            }, 5000); // Wait 5 seconds before cleanup
        }
        
        // 9. SEND RESPONSE
        console.log('\n📤 ===== SENDING ASYNC RESPONSE (202 ACCEPTED) =====');
        const responseStatus = job_id ? 202 : 503;
        
        const responseData = {
            success: !!job_id,
            message: job_id 
                ? 'Crop submitted. Grading job accepted and is now pending.'
                : 'Crop saved, but ML job submission failed. Try checking status later.',
            cropListingId: savedCrop._id,
            job_id: job_id 
        };
        
        console.log('Response:', JSON.stringify(responseData, null, 2));
        res.status(responseStatus).json(responseData);
        
        console.log('🟢 ===== ASYNC JOB SUBMISSION COMPLETED =====\n');
        
    } catch (error) {
        console.error('\n❌❌❌ CONTROLLER ERROR ❌❌❌');
        console.error('Full error:', error);
        
        res.status(500).json({
            success: false,
            message: 'Error submitting crop for grading',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

exports.checkGradingStatus = async (req, res) => {
    const { jobId } = req.params;
    
    console.log(`\n🔍 Checking status for job: ${jobId}`);
    
    if (!jobId) {
        return res.status(400).json({ success: false, message: 'Job ID is required.' });
    }
    
    try {
        // First check if we have it in our database (webhook might have already updated it)
        const crop = await CropListing.findOne({ mlJobId: jobId });
        
        if (crop && crop.status === 'graded') {
            console.log(`✅ Job ${jobId} already completed in database`);
            return res.status(200).json({
                job_id: jobId,
                status: 'completed',
                result: {
                    grade: crop.grade,
                    confidence: crop.qualityScore,
                    overall_confidence: crop.gradeDetails?.overall_confidence || crop.qualityScore,
                    grade_breakdown: crop.gradeDetails?.grade_breakdown || {},
                    frames_analyzed: crop.gradeDetails?.frames_analyzed || 0
                }
            });
        }
        
        // If not in database yet, check ML service
        const mlStatusUrl = `${ML_SERVICE_URL}/api/ml/status/${jobId}`;
        console.log(`📡 Calling ML service: ${mlStatusUrl}`);
        
        const mlResponse = await axios.get(mlStatusUrl, {
            timeout: 5000 // Shorter timeout
        });

        console.log(`✅ ML Status response:`, mlResponse.data);
        return res.status(200).json(mlResponse.data);

    } catch (error) {
        console.error(`❌ Error checking status for job ${jobId}:`, error.message);
        
        // If ML service is down, check database one more time
        try {
            const crop = await CropListing.findOne({ mlJobId: jobId });
            if (crop) {
                // Return pending status if we have the job in database
                return res.status(200).json({
                    job_id: jobId,
                    status: crop.status === 'graded' ? 'completed' : 'processing',
                    result: crop.status === 'graded' ? {
                        grade: crop.grade,
                        confidence: crop.qualityScore
                    } : null
                });
            }
        } catch (dbError) {
            console.error('Database fallback failed:', dbError);
        }
        
        let errorMessage = 'Failed to check grading status';
        let statusCode = 503;

        if (error.response) {
            errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
            statusCode = error.response.status;
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = 'ML service timeout - job might still be processing';
        }

        return res.status(statusCode).json({
            success: false,
            status: 'error',
            error: errorMessage
        });
    }
};

// GET ALL CROPS
exports.getAllCrops = async (req, res) => {
    try {
        const crops = await CropListing.find({ 
            status: { $in: ['active', 'bidding', 'graded', 'pending_grading'] } 
        })
            .populate('farmerId', 'name email phone')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, listings: crops });
    } catch (error) {
        console.error('❌ Error fetching crops:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching crops for marketplace',
            error: error.message,
        });
    }
};

// GET CROP BY ID
exports.getCropById = async (req, res) => {
    try {
        const { id } = req.params;
        const crop = await CropListing.findById(id)
            .populate('farmerId', 'name email phone');
        if (!crop) {
            return res.status(404).json({
                success: false,
                message: 'Crop not found',
            });
        }
        res.status(200).json({ success: true, crop });
    } catch (error) {
        console.error('❌ Error fetching crop by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching crop',
            error: error.message,
        });
    }
};

// GET FARMER'S LISTINGS
exports.getFarmersListings = async (req, res) => {
    try {
        const { farmerId } = req.params;
        const listings = await CropListing.find({ farmerId: farmerId })
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, cropListings: listings });
    } catch (error) {
        console.error('❌ Error fetching farmer listings:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching farmer listings',
            error: error.message,
        });
    }
};

exports.updateGradeFromML = async (req, res) => {
    console.log('\n🔔 ===== ML GRADING COMPLETION WEBHOOK =====');
    
    try {
        const { job_id, status, result, error } = req.body;
        
        if (!job_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'job_id is required' 
            });
        }

        const crop = await CropListing.findOne({ mlJobId: job_id });
        
        if (!crop) {
            console.log(`⚠️ No crop found for job_id: ${job_id}`);
            return res.status(404).json({ 
                success: false, 
                message: 'Crop listing not found for this job' 
            });
        }

        if (status === 'completed' && result) {
            crop.status = 'graded';
            crop.grade = result.grade;
            crop.qualityScore = result.confidence;
            crop.gradeDetails = {
                overall_confidence: result.overall_confidence,
                grade_breakdown: result.grade_breakdown,
                frames_analyzed: result.frames_analyzed
            };
            
            console.log(`✅ Updated crop ${crop._id} with grade: ${result.grade}`);
        } else if (status === 'failed') {
            crop.status = 'grading_failed';
            crop.gradeDetails = { error: error || 'Grading failed' };
            
            console.log(`❌ Marked crop ${crop._id} as failed: ${error}`);
        }

        await crop.save();
        
        res.status(200).json({ 
            success: true, 
            message: 'Crop updated successfully',
            cropId: crop._id 
        });

    } catch (error) {
        console.error('❌ Error in webhook:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};
