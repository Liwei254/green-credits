/**
 * Green Credits - Simple Upload Server
 * 
 * A minimal Express server with multer for handling file uploads
 * and NFT.Storage for IPFS storage.
 * 
 * Note: This is a simplified alternative to index.mjs.
 * The main server (index.mjs) uses the modern Storacha w3up client.
 * This file demonstrates a simpler approach using the classic NFT.Storage API.
 * 
 * Usage:
 *   node server/upload.js
 * 
 * Environment Variables:
 *   PORT - Server port (default: 8787)
 *   NFT_STORAGE_TOKEN - NFT.Storage API token (classic API)
 *   CORS_ORIGINS - Allowed CORS origins (default: http://localhost:5173)
 */

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { NFTStorage, File } = require('nft.storage');
require('dotenv').config();

const PORT = process.env.PORT || 8787;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Initialize NFT.Storage client
const NFT_STORAGE_TOKEN = process.env.NFT_STORAGE_TOKEN;
if (!NFT_STORAGE_TOKEN) {
  console.warn('⚠️  NFT_STORAGE_TOKEN not set. Uploads will fail.');
  console.log('💡 Get a token from https://nft.storage');
}

const client = NFT_STORAGE_TOKEN ? new NFTStorage({ token: NFT_STORAGE_TOKEN }) : null;

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    // Optional: Add file type validation here
    // For now, accept all files
    cb(null, true);
  },
});

// Create Express app
const app = express();

// Configure CORS
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim());

app.use(cors({
  origin: corsOrigins,
  methods: ['GET', 'POST'],
  credentials: true,
}));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'green-credits-upload-server',
    version: '1.0.0',
    storage: client ? 'nft.storage' : 'not configured',
  });
});

// Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        details: 'Please provide a file in the "file" field',
      });
    }

    // Check if client is initialized
    if (!client) {
      return res.status(503).json({
        error: 'Upload service not configured',
        details: 'NFT_STORAGE_TOKEN is not set',
      });
    }

    // Get file info
    const { buffer, originalname, mimetype } = req.file;
    
    console.log(`📤 Uploading file: ${originalname} (${buffer.length} bytes, ${mimetype})`);

    // Upload to NFT.Storage
    const file = new File([buffer], originalname, { type: mimetype });
    const cid = await client.storeBlob(file);

    console.log(`✅ Upload successful: ${cid}`);

    // Return CID and gateway URL
    res.json({
      cid,
      url: `https://nftstorage.link/ipfs/${cid}`,
    });

  } catch (error) {
    console.error('❌ Upload failed:', error);
    
    // Handle specific errors
    if (error.message.includes('File too large')) {
      return res.status(413).json({
        error: 'File too large',
        details: `Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      });
    }

    // Generic error response
    res.status(500).json({
      error: 'Upload failed',
      details: error.message,
    });
  }
});

// Handle multer errors (file too large, etc.)
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'File too large',
        details: `Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      });
    }
    return res.status(400).json({
      error: 'Upload error',
      details: error.message,
    });
  }
  next(error);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    details: 'Endpoint not found',
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 Green Credits Upload Server');
  console.log('================================');
  console.log(`📝 Server listening on http://localhost:${PORT}`);
  console.log(`🔐 CORS enabled for: ${corsOrigins.join(', ')}`);
  console.log(`💾 Max file size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  console.log(`📦 Storage: ${client ? 'NFT.Storage (classic API)' : 'NOT CONFIGURED'}`);
  
  if (!client) {
    console.log('\n⚠️  WARNING: NFT_STORAGE_TOKEN not set!');
    console.log('💡 Get a token from https://nft.storage');
    console.log('💡 Or use the main server (index.mjs) with Storacha w3up');
  }
  
  console.log('\n✨ Ready to accept uploads!\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});
