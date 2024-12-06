// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('./models/user');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect('mongodb+srv://santhoshnaresh875:2nIwIFpCQ7vdwznj@cluster0.pviwidr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and image files are allowed.'), false);
  }
};

const upload = multer({ storage, fileFilter });

// POST endpoint to create a new user
app.post('/createUser', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'image', maxCount: 1 }]), async (req, res) => {
  const { firstname, lastname, email, gender, city, state, zip } = req.body;
  const file = req.files['file'] ? req.files['file'][0].filename : null;
  const image = req.files['image'] ? req.files['image'][0].filename : null;

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({ error: 'registered' });
    }

    // If email is not registered, save the user
    const newUser = new User({ firstname, lastname, email, gender, city, state, zip, file, image });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to serve PDF files
app.get('/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  // Check if the file exists
  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Content-Disposition', `inline; filename=${filename}`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } else {
    res.status(404).send('File not found');
  }
});

// Endpoint to serve image files
app.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  // Check if the file exists
  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Content-Disposition', `inline; filename=${filename}`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } else {
    res.status(404).send('File not found');
  }
});

// Get all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user by ID
app.put('/updateUser/:id', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'image', maxCount: 1 }]), async (req, res) => {
  const id = req.params.id;
  const { firstname, lastname, email, gender, city, state, zip } = req.body;
  const file = req.files['file'] ? req.files['file'][0].filename : null;
  const image = req.files['image'] ? req.files['image'][0].filename : null;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Update user fields
    user.firstname = firstname;
    user.lastname = lastname;
    user.email = email;
    user.gender = gender;
    user.city = city;
    user.state = state;
    user.zip = zip;

    // Update file and image if provided
    if (file) user.file = file;
    if (image) user.image = image;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user by ID
app.delete('/deleteData/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Delete the associated file if exists
    if (user.file) {
      const filePath = path.join(__dirname, 'uploads', user.file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete the associated image if exists
    if (user.image) {
      const imagePath = path.join(__dirname, 'uploads', user.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete the user
    await User.findByIdAndDelete(id);
    res.status(200).send({ message: 'User and associated data deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
