const mongoose = require('mongoose');

const cropListingSchema = new mongoose.Schema({
    farmerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    crop: { 
        type: String, 
        required: true 
    },
    quantityKg: { 
        type: Number, 
        required: true 
    },
    pricePerKg: { 
        type: Number, 
        required: true 
    },
    location: { 
        type: String, 
        required: true 
    },
    details: { 
        type: String 
    },
    marketChoice: { 
        type: String, 
        enum: ['primary', 'zero-waste'], 
        default: 'primary' 
    },
    videoUrl: { 
        type: String, 
        required: true 
    },
    grade: { 
        type: String, 
        enum: ['A', 'B', 'C', 'Pending'], 
        default: 'Pending' 
    },
    qualityScore: { 
        type: Number, 
        default: 0 
    },
    status: { 
        type: String, 
        enum: ['pending_grading', 'graded', 'active', 'bidding', 'sold', 'grading_failed', 'failed_submission'], 
        default: 'pending_grading' 
    },
    // 🆕🆕🆕 ADD THESE NEW FIELDS 🆕🆕🆕
    mlJobId: { 
        type: String, 
        default: null 
    },
    gradeDetails: { 
        type: Object, 
        default: {} 
    },
    physicalAudit: { 
        type: Object, 
        default: {} 
    }
}, { timestamps: true });

module.exports = mongoose.model('CropListing', cropListingSchema);
