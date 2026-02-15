const Drop = require('../models/Drop');
const { nanoid } = require('nanoid');
const cloudinary = require('../config/cloudinary');
const bcrypt = require('bcryptjs');

// 1. Create Drop
exports.createDrop = async (req, res) => {
  try {
    const { type, textContent, expiresInMinutes, password, oneTimeView, maxDownloads } = req.body;
    const shortId = nanoid(8);
    const deleteToken = nanoid(16); // Secret key for manual deletion

    // Calculate Expiry
    const expiryTime = expiresInMinutes ? parseInt(expiresInMinutes) : 10;
    const expiresAt = new Date(Date.now() + expiryTime * 60000);

    let newDropData = {
      shortId,
      deleteToken,
      type,
      expiresAt,
      oneTimeView: oneTimeView === 'true', // FormData sends booleans as strings
      maxDownloads: maxDownloads ? parseInt(maxDownloads) : null,
    };

    // Hash Password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      newDropData.password = await bcrypt.hash(password, salt);
    }

    if (type === 'text') {
      if (!textContent) return res.status(400).json({ error: 'Text content is empty' });
      newDropData.textContent = textContent;
    } else if (type === 'file') {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      newDropData.fileUrl = req.file.path;
      newDropData.publicId = req.file.filename;
      newDropData.originalName = req.file.originalname;
      newDropData.mimeType = req.file.mimetype;
    }

    await Drop.create(newDropData);
    res.status(201).json({ 
      success: true, 
      link: `${process.env.CLIENT_URL}/${shortId}`,
      deleteToken: deleteToken // Return this only once!
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// 2. Retrieve Drop (Protected)
exports.getDrop = async (req, res) => {
  try {
    const { shortId } = req.params;
    const { password } = req.query; // Password sent via query param or body

    const drop = await Drop.findOne({ shortId });

    if (!drop) return res.status(404).json({ error: 'Link not found' });
    if (new Date() > drop.expiresAt) return res.status(403).json({ error: 'Link has expired' });

    // A. Check Max Downloads
    if (drop.maxDownloads && drop.viewCount >= drop.maxDownloads) {
        return res.status(410).json({ error: 'Maximum views reached. Link is dead.' });
    }

    // B. Check Password
    if (drop.password) {
        if (!password) {
            return res.status(401).json({ error: 'Password required', isProtected: true });
        }
        const isMatch = await bcrypt.compare(password, drop.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect password', isProtected: true });
        }
    }

    // C. Update View Count & One-Time Logic
    drop.viewCount += 1;
    await drop.save();

    // If One-Time View, we delete AFTER this response (or mark expired)
    if (drop.oneTimeView) {
        // We set expiry to NOW so it's inaccessible immediately after this
        drop.expiresAt = new Date();
        await drop.save();
    }

    res.json(drop);

  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// 3. Manual Delete
exports.deleteDrop = async (req, res) => {
    try {
        const { shortId, deleteToken } = req.body;
        const drop = await Drop.findOne({ shortId });

        if (!drop) return res.status(404).json({ error: 'Not found' });
        if (drop.deleteToken !== deleteToken) return res.status(403).json({ error: 'Invalid Delete Token' });

        if (drop.type === 'file' && drop.publicId) {
            await cloudinary.uploader.destroy(drop.publicId, { resource_type: 'raw' });
            await cloudinary.uploader.destroy(drop.publicId);
        }
        await Drop.deleteOne({ _id: drop._id });

        res.json({ success: true, message: 'Drop deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
};