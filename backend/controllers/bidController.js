// controllers/bidController.js
// ============================================
const Bid = require('../models/Bid');
const CropListing = require('../models/CropListing');
exports.placeBid = async (req, res) => {
try {
const { cropListingId, buyerId, bidAmount } = req.body;
const crop = await CropListing.findById(cropListingId);
if (!crop) {
  return res.status(404).json({
    success: false,
    message: 'Crop not found',
  });
}

const newBid = new Bid({
  cropListingId,
  buyerId,
  bidAmount,
  bidStatus: 'pending',
});

const savedBid = await newBid.save();

res.status(201).json({
  success: true,
  message: 'Bid placed successfully',
  bidId: savedBid._id,
  bid: savedBid,
});
} catch (error) {
res.status(500).json({
success: false,
message: 'Error placing bid',
error: error.message,
});
}
};
exports.getBidsForCrop = async (req, res) => {
try {
const { cropId } = req.params;
const bids = await Bid.find({ cropListingId: cropId })
  .populate('buyerId', 'name email phone')
  .sort({ bidAmount: -1 });

res.status(200).json({
  success: true,
  bids,
});
} catch (error) {
res.status(500).json({
success: false,
message: 'Error fetching bids',
error: error.message,
});
}
};
exports.markBidAsWon = async (req, res) => {
try {
const { bidId } = req.params;
const { deliveryDays, shippingCost } = req.body;
const bid = await Bid.findById(bidId);
if (!bid) {
  return res.status(404).json({
    success: false,
    message: 'Bid not found',
  });
}

const estimatedDelivery = new Date();
estimatedDelivery.setDate(estimatedDelivery.getDate() + deliveryDays);

bid.bidStatus = 'won';
bid.winnerLogistics = {
  deliveryDays,
  shippingCost,
  estimatedDelivery,
};

const updatedBid = await bid.save();

await CropListing.findByIdAndUpdate(bid.cropListingId, { status: 'sold' });

res.status(200).json({
  success: true,
  message: 'Bid marked as won',
  bid: updatedBid,
  logisticsMessage: `Congratulations! Your delivery will arrive in ${deliveryDays} days (${estimatedDelivery.toDateString()}). Shipping cost: ₹${shippingCost}`,
});
} catch (error) {
res.status(500).json({
success: false,
message: 'Error marking bid as won',
error: error.message,
});
}
};