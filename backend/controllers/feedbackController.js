// controllers/feedbackController.js
const Feedback = require('../models/Feedback');
const Registration = require('../models/Registration');

// ✅ Student submits feedback for an event
exports.submitFeedback = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { rating, comment, anonymous = false } = req.body;
    const userId = req.user.id;

    // Check if student attended the event
    const registration = await Registration.findOne({
      eventId,
      userId,
      $or: [
        { attended: true },
        { checkInAt: { $exists: true } },
        { status: 'attended' }
      ]
    });

    if (!registration) {
      return res.status(403).json({
        success: false,
        message: 'You must attend the event to give feedback'
      });
    }

    // Check if feedback already submitted
    const existingFeedback = await Feedback.findOne({
      eventId,
      userId
    });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted feedback for this event'
      });
    }

    // Create feedback
    const feedback = await Feedback.create({
      eventId,
      userId,
      studentName: anonymous ? undefined : req.user.name,
      rating,
      comment,
      anonymous,
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback'
    });
  }
};

// ✅ Admin gets feedback for an event (already in adminController.js)