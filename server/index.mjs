#!/usr/bin/env node
/**
 * Green Credits Upload Proxy
 * A secure server-side proxy for uploading files to NFT.storage
 * using NFT.storage API with token authentication.
 * This keeps sensitive API tokens server-side only,
 * preventing exposure of credentials in the browser.
 */

import express from 'express';
import cors from 'cors';
import busboy from 'busboy';
import dotenv from 'dotenv';
import { NFTStorage } from 'nft.storage';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 8787;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (frontend uses 8MB, add buffer)

/**
 * Initialize NFT.storage client with API token from environment
 */
async function initNFTStorageClient() {
  const token = process.env.NFT_STORAGE_TOKEN;
  if (!token) {
    throw new Error('NFT_STORAGE_TOKEN is required in environment');
  }

  return new NFTStorage({ token });
}

/**
 * Parse multipart form-data and extract a single file
 */
function parseMultipartFile(req) {
  return new Promise((resolve, reject) => {
    const bb = busboy({ headers: req.headers });
    let fileBuffer = null;
    let fileName = null;
    let fileSize = 0;

    bb.on('file', (fieldname, stream, info) => {
      if (fieldname !== 'file') {
        stream.resume(); // Drain unwanted fields
        return;
      }

      fileName = info.filename || 'uploaded-file';
      const chunks = [];
      let rejected = false;

      stream.on('data', (chunk) => {
        if (rejected) return; // Already rejected, skip processing
        
        fileSize += chunk.length;
        if (fileSize > MAX_FILE_SIZE) {
          rejected = true;
          stream.resume(); // Drain the stream
          reject(new Error(`File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`));
          return;
        }
        chunks.push(chunk);
      });

      stream.on('end', () => {
        if (!rejected && fileSize <= MAX_FILE_SIZE) {
          fileBuffer = Buffer.concat(chunks);
        }
      });
    });

    bb.on('finish', () => {
      if (!fileBuffer) {
        reject(new Error('No file uploaded or file too large'));
      } else {
        resolve({ buffer: fileBuffer, name: fileName });
      }
    });

    bb.on('error', (err) => {
      reject(err);
    });

    req.pipe(bb);
  });
}

/**
 * Main server initialization
 */
async function main() {
  // Initialize NFT.storage client
  let client = null;
  try {
    client = await initNFTStorageClient();
    console.log('✅ NFT.storage client initialized successfully');
  } catch (err) {
    console.error('❌ Failed to initialize NFT.storage client:', err.message);
    console.log('⚠️  Continuing without client - uploads will fail');
  }

  // Create Express app
  const app = express();

  // Configure CORS
  const corsOrigins = process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:5173']; // Vite default

  app.use(cors({
    origin: corsOrigins,
    methods: ['GET', 'POST'],
    credentials: false
  }));

  // Health check endpoint
  app.get('/', (req, res) => {
    res.json({ 
      status: 'ok', 
      service: 'green-credits-upload-proxy',
      version: '1.0.0'
    });
  });

  // Upload endpoint
  app.post('/upload', async (req, res) => {
    try {
      if (!client) {
        return res.status(503).json({
          error: 'Upload service unavailable',
          details: 'NFT.storage client not initialized'
        });
      }

      const { buffer, name } = await parseMultipartFile(req);

      // Create a File-like object for upload
      const file = new File([buffer], name, { type: 'application/octet-stream' });

      // Upload to NFT.storage
      const cid = await client.storeBlob(new Blob([file]));

      res.json({
        cid: cid.toString(),
        url: `https://nftstorage.link/ipfs/${cid.toString()}`
      });
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({
        error: 'Upload failed',
        details: err.message
      });
    }
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 Upload proxy listening on http://localhost:${PORT}`);
    console.log(`📝 CORS enabled for: ${corsOrigins.join(', ')}`);
    console.log(`💾 Max file size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  });
}

// Run the server
main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});