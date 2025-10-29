#!/usr/bin/env node
/**
 * Green Credits Upload Proxy
 * * A secure server-side proxy for uploading files to Storacha/Web3.Storage
 * using w3up-client with DID/UCAN authentication.
 * * This keeps sensitive agent keys and UCAN proofs server-side only,
 * preventing exposure of credentials in the browser.
 */

import express from 'express';
import cors from 'cors';
import busboy from 'busboy';
import dotenv from 'dotenv';
import { create as createClient } from '@storacha/client';
import { CarReader } from '@ipld/car'; // <-- Correct import
import { readFile } from 'fs/promises';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 8787;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (frontend uses 8MB, add buffer)

/**
 * Initialize w3up client with agent credentials from environment
 */
async function initW3UpClient() {
  const spaceDID = process.env.W3UP_SPACE_DID;
  if (!spaceDID) {
    throw new Error('W3UP_SPACE_DID is required in environment');
  }
  if (!process.env.W3UP_AGENT_FILE) {
    throw new Error('W3UP_AGENT_FILE must be set');
  }

  // 1. Read the agent's binary CAR file
  let carBytes;
  try {
    // Read the raw binary data (do NOT use 'utf-8')
    carBytes = await readFile(process.env.W3UP_AGENT_FILE);
  } catch (err) {
    throw new Error('Failed to read W3UP_AGENT_FILE: ' + err.message);
  }

  // 2. Create the client first
  const client = await createClient();

  // 3. Import the agent data from the CAR and restore it
  try {
    // For @storacha/client v1.8.11, try different import methods
    if (typeof client.agent.import === 'function') {
      await client.agent.import(carBytes);
    } else if (typeof client.agent.restore === 'function') {
      // Parse CAR file for restore method
      const reader = await CarReader.fromBytes(carBytes);
      const roots = await reader.getRoots();
      const blocks = [];
      for await (const block of reader.blocks()) {
        blocks.push(block);
      }
      await client.agent.restore({ roots, blocks });
    } else {
      throw new Error('No suitable agent import/restore method found');
    }
  } catch (err) {
    throw new Error('Failed to import/restore agent from CAR file: ' + err.message);
  }

  // 4. Set the current space
  try {
    await client.setCurrentSpace(spaceDID);
  } catch (err) {
    throw new Error('Failed to set space ' + spaceDID + ': ' + err.message);
  }

  return client;
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
  // Initialize w3up client (temporarily disabled for testing)
  console.log('🔐 Skipping w3up client initialization (temporarily disabled)');
  let client = null;
  /*
  try {
    client = await initW3UpClient();
    console.log('✅ w3up client initialized successfully');
  } catch (err) {
    console.error('❌ Failed to initialize w3up client:', err.message);
    process.exit(1);
  }
  */

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

  // Upload endpoint (temporarily disabled)
  app.post('/upload', async (req, res) => {
    res.status(503).json({
      error: 'Upload service temporarily disabled',
      details: 'Storacha client initialization is disabled for testing'
    });
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