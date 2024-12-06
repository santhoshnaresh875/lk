const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/user');



// Multer configuration for PDF files only
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Add a timestamp to the original filename
  },
});

// File filter function for multer to allow only PDF files and check for empty files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    if (file.size > 0) { // Ensure file is not empty
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Uploaded file is empty!'), false); // Reject empty files
    }
  } else {
    cb(new Error('Only PDF files are allowed!'), false); // Reject non-PDF files
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 524 * 524 * 5 }, // 5MB file size limit
  fileFilter: fileFilter,
});

// Create new user with PDF file upload
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { firstname, lastname, email, gender, city, state, zipcode } = req.body;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file.' });
    }

    const file = req.file.path;

    // Validate required fields
    if (!firstname || !lastname || !email || !gender || !city || !state || !zipcode) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    // Create new user instance
    const newUser = new User({
      firstname,
      lastname,
      email,
      gender,
      city,
      state,
      zipcode,
      file,
    });

    // Save user to the database
    await newUser.save();
    res.status(201).json(newUser); // Respond with the created user
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' }); // Handle server errors
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users); // Respond with all users
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' }); // Handle server errors
  }
});

module.exports = router;
