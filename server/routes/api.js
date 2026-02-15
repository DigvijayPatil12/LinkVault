const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const { createDrop, getDrop, deleteDrop } = require('../controllers/dropController');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: { folder: 'linkvault_uploads', resource_type: 'auto' },
});
const upload = multer({ storage: storage });

router.post('/upload', upload.single('file'), createDrop);
router.get('/:shortId', getDrop);
router.post('/delete', deleteDrop); // New Route

module.exports = router;