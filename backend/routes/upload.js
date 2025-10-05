const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const dotenv = require('dotenv');
const { Card } = require('../models/Card'); // adjust path to your model
dotenv.config();

const router = express.Router();

// Initialize AWS S3 client (v3)
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Use multer to handle file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Upload file to S3 and attach to a card
router.post('/:cardId', upload.single('file'), async (req, res) => {
  try {
    const { cardId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    // Upload file
    await s3.send(new PutObjectCommand(uploadParams));

    // Generate presigned URL for access
    const url = await getSignedUrl(s3, new PutObjectCommand(uploadParams), { expiresIn: 3600 });

    // Save to MongoDB card
    const attachment = {
      name: file.originalname,
      url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`,
      type: file.mimetype,
      size: file.size
    };

    const card = await Card.findByIdAndUpdate(
      cardId,
      { $push: { attachments: attachment } },
      { new: true }
    );

    res.json(attachment);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;