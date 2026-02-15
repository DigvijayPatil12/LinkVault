const mongoose = require('mongoose');

const DropSchema = new mongoose.Schema({
  shortId: { type: String, required: true, unique: true },
  type: { type: String, enum: ['text', 'file'], required: true },
  
  // Content
  textContent: { type: String },
  fileUrl: { type: String },
  publicId: { type: String },
  originalName: { type: String },
  mimeType: { type: String },

  // Security & Limits
  password: { type: String }, // Hashed password
  oneTimeView: { type: Boolean, default: false },
  maxDownloads: { type: Number, default: null },
  viewCount: { type: Number, default: 0 },
  deleteToken: { type: String, required: true }, // Key to manually delete

  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

module.exports = mongoose.model('Drop', DropSchema);