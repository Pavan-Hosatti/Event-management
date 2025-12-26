// Simple AI grader controller - provides status and mock grading
const fs = require('fs');

exports.getStatus = async (req, res) => {
  try {
    res.json({ success: true, status: 'ready', info: 'AI Grader compatibility endpoint' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get status' });
  }
};

exports.gradeCrop = async (req, res) => {
  try {
    // This is a compatibility mock endpoint. In production, connect to ML grading pipeline.
    // If file uploaded via multer, req.file will be present.
    const fileInfo = req.file ? { originalname: req.file.originalname, size: req.file.size } : null;

    // Return a simple, deterministic mock result
    const grades = ['A', 'B', 'C'];
    const grade = grades[Math.floor(Math.random() * grades.length)];

    res.json({ success: true, grade, confidence: Math.floor(Math.random() * 20) + 80, file: fileInfo });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Grading failed', error: err.message });
  }
};
