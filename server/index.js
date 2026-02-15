const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cron = require('node-cron');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');
const Drop = require('./models/Drop');
const cloudinary = require('./config/cloudinary');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use('/api', apiRoutes);

// CRON JOB: Runs every hour to clean up expired files
cron.schedule('0 * * * *', async () => {
  console.log('Running expiry cleanup job...');
  try {
    const expiredDrops = await Drop.find({ expiresAt: { $lt: new Date() } });

    for (const drop of expiredDrops) {
      if (drop.type === 'file' && drop.publicId) {
         // Delete from Cloudinary
         await cloudinary.uploader.destroy(drop.publicId, { resource_type: 'raw' });
         await cloudinary.uploader.destroy(drop.publicId); 
      }
      await Drop.deleteOne({ _id: drop._id });
    }
    if (expiredDrops.length > 0) {
        console.log(`Cleaned up ${expiredDrops.length} expired drops.`);
    }
  } catch (err) {
    console.error('Cleanup Job Failed:', err);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));