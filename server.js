const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

const cors = require('cors');
app.use(cors());

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '/uploads/');
    fs.mkdirSync(uploadPath, { recursive: true }); // Ensure directory exists
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Use the original filename or generate a new one here
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Serve files from the uploads directory
app.use('/uploads', express.static('uploads'));

// Endpoint to handle image uploads
app.post('/upload', upload.single('cameraImage'), (req, res) => {

  if (req.file) {
    const color = req.body.color;
    const type = req.body.type;

    // Construct the file path or URL
    const filePath = `/uploads/${req.file.filename}`;

    res.json({ 
      success: true, 
      message: 'File uploaded successfully', 
      filePath, // Send this back to the client
      color, 
      type 
    });
  } else {
    res.status(400).json({ success: false, message: 'No file uploaded' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
