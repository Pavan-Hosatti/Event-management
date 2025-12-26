// models/Bid.js
// ============================================
const mongoose = require('mongoose');
const bidSchema = new mongoose.Schema(
{
cropListingId: {
type: mongoose.Schema.Types.ObjectId,
ref: 'CropListing',
required: true,
},
buyerId: {
type: mongoose.Schema.Types.ObjectId,
ref: 'User',
required: true,
},
bidAmount: {
type: Number,
required: true,
},
bidStatus: {
type: String,
enum: ['pending', 'won', 'lost'],
default: 'pending',
},
winnerLogistics: {
deliveryDays: Number,
shippingCost: Number,
estimatedDelivery: Date,
},
createdAt: {
type: Date,
default: Date.now,
},
},
{ timestamps: true }
);
module.exports = mongoose.model('Bid', bidSchema);




//let's gooo


