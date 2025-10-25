#!/usr/bin/env node
/**
 * Green Credits Upload Proxy
 * 
 * A secure server-side proxy for uploading files to Storacha/Web3.Storage
 * using w3up-client with DID/UCAN authentication.
 * 
 * This keeps sensitive agent keys and UCAN proofs server-side only,
 * preventing exposure of credentials in the browser.
 */

import express from 'express';
import cors from 'cors';
import busboy from 'busboy';
import dotenv from 'dotenv';
import { create as createClient } from '@web3-storage/w3up-client';
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

  // Get agent export from env (inline or file)
  let agentExport;
  
  if (process.env.W3UP_AGENT) {
    // Option 1: Inline JSON string
    try {
      agentExport = JSON.parse(process.env.W3UP_AGENT);
    } catch (err) {
      throw new Error('Failed to parse W3UP_AGENT JSON: ' + err.message);
    }
  } else if (process.env.W3UP_AGENT_FILE) {
    // Option 2: Load from file
    try {
      const content = await readFile(process.env.W3UP_AGENT_FILE, 'utf-8');
      agentExport = JSON.parse(content);
    } catch (err) {
      throw new Error('Failed to read W3UP_AGENT_FILE: ' + err.message);
    }
  } else {
    throw new Error('Either W3UP_AGENT or W3UP_AGENT_FILE must be set');
  }

  // Create client and restore agent
  const client = await createClient();
  
  // Try to import agent data - w3up-client API may vary by version
  try {
    // Try new API first
    if (typeof client.agent.restore === 'function') {
      await client.agent.restore(agentExport);
    } else if (typeof client.agent.import === 'function') {
      await client.agent.import(agentExport);
    } else {
      // Fallback: directly set agent data (for older versions)
      throw new Error('Unsupported w3up-client version: no agent.restore() or agent.import()');
    }
  } catch (err) {
    throw new Error('Failed to restore agent: ' + err.message);
  }

  // Set the current space
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
  // Initialize w3up client
  console.log('🔐 Initializing w3up client...');
  let client;
  try {
    client = await initW3UpClient();
    console.log('✅ w3up client initialized successfully');
  } catch (err) {
    console.error('❌ Failed to initialize w3up client:', err.message);
    process.exit(1);
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
      // Parse multipart form data
      const { buffer, name } = await parseMultipartFile(req);
      
      console.log(`📤 Uploading file: ${name} (${buffer.length} bytes)`);

      // Convert Buffer to Blob for w3up-client
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      
      // Upload to Storacha/Web3.Storage
      const cid = await client.uploadFile(blob, { name });
      
      console.log(`✅ Upload successful: ${cid.toString()}`);

      // Return CID in the format expected by frontend
      res.json({ 
        cid: cid.toString(),
        url: `https://w3s.link/ipfs/${cid.toString()}`
      });
    } catch (err) {
      console.error('❌ Upload failed:', err.message);
      res.status(500).json({ 
        error: err.message || 'Upload failed',
        details: 'Check server logs for more information'
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
