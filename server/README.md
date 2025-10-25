# Green Credits Upload Proxy

A secure server-side proxy for uploading files to Storacha/Web3.Storage using w3up-client with DID/UCAN authentication. This keeps sensitive agent keys and UCAN proofs server-side only, preventing exposure of credentials in the browser.

## Why This Proxy?

The Green Credits dApp needs to upload proof images to IPFS via Storacha (Web3.Storage). Storacha's new w3up architecture uses DID (Decentralized Identifiers) and UCAN (User Controlled Authorization Networks) instead of simple bearer tokens.

**Problem**: DID private keys and UCAN proofs cannot be safely exposed in the browser.

**Solution**: This proxy server holds the agent credentials and performs uploads on behalf of the frontend.

## Prerequisites

1. A Storacha/Web3.Storage account and space
2. Node.js 18+ (for native Blob support)
3. Exported agent credentials (keys + UCAN proofs)

## Setup Instructions

### 1. Get Your Agent Credentials

If you don't have an agent export yet, follow these steps:

#### Option A: Using w3 CLI (Recommended)

```bash
# Install the w3 CLI globally
npm install -g @web3-storage/w3cli

# Login to your account
w3 login your-email@example.com

# Create a space (or use existing)
w3 space create my-green-credits-space

# Export your agent data
w3 key export > agent-export.json

# Get your space DID
w3 space ls
# Copy the DID (looks like: did:key:z6Mkk...)
```

#### Option B: Programmatically

```javascript
import { create } from '@web3-storage/w3up-client';

const client = await create();
await client.login('your-email@example.com');

// Create space
const space = await client.createSpace('my-green-credits-space');
await client.setCurrentSpace(space.did());

// Export agent
const agentExport = await client.agent.export();
console.log('Space DID:', space.did());
console.log('Agent Export:', JSON.stringify(agentExport, null, 2));
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env and set:
# - W3UP_SPACE_DID: Your space DID from step 1
# - W3UP_AGENT_FILE: Path to your agent-export.json (or use W3UP_AGENT for inline JSON)
# - PORT: Port to run the server on (default: 8787)
# - CORS_ORIGINS: Allowed frontend origins (default: http://localhost:5173)
```

Example `.env`:

```env
PORT=8787
W3UP_SPACE_DID=did:key:z6MkkYourSpaceDIDHere
W3UP_AGENT_FILE=./agent-export.json
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Server

```bash
npm start
```

You should see:
```
🔐 Initializing w3up client...
✅ w3up client initialized successfully
🚀 Upload proxy listening on http://localhost:8787
📝 CORS enabled for: http://localhost:5173
💾 Max file size: 10MB
```

## Testing the Proxy

### Test with curl

```bash
# Health check
curl http://localhost:8787/

# Upload a test file
curl -X POST http://localhost:8787/upload \
  -F "file=@path/to/test-image.jpg"
```

Expected response:
```json
{
  "cid": "bafkreih...",
  "url": "https://w3s.link/ipfs/bafkreih..."
}
```

### Test with Frontend

1. In your frontend `.env`:
   ```env
   VITE_UPLOAD_PROXY_URL=http://localhost:8787/upload
   ```

2. Start the frontend dev server:
   ```bash
   cd ../frontend
   npm run dev
   ```

3. Submit an eco-action with a proof image. The upload should go through the proxy.

## API Reference

### `GET /`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "green-credits-upload-proxy",
  "version": "1.0.0"
}
```

### `POST /upload`

Upload a file to Storacha/Web3.Storage.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form field `file` containing the file to upload

**Response (Success):**
```json
{
  "cid": "bafkreih...",
  "url": "https://w3s.link/ipfs/bafkreih..."
}
```

**Response (Error):**
```json
{
  "error": "Error message",
  "details": "Check server logs for more information"
}
```

**Limits:**
- Max file size: 10MB
- Single file per request

## Security Considerations

1. **Agent Keys**: Never commit your `.env` or `agent-export.json` files to version control
2. **CORS**: Restrict `CORS_ORIGINS` to only your frontend domains
3. **Rate Limiting**: Consider adding rate limiting middleware for production
4. **Authentication**: For production, add request authentication (e.g., JWT tokens)
5. **File Validation**: The proxy only validates file size; add content-type validation if needed

## Troubleshooting

### "W3UP_SPACE_DID is required"
Make sure your `.env` file exists and has the `W3UP_SPACE_DID` set.

### "Failed to restore agent"
- Verify your agent export JSON is valid
- Check that the file path in `W3UP_AGENT_FILE` is correct
- Ensure you're using a compatible version of `@web3-storage/w3up-client`

### "Failed to set space"
- Verify the Space DID is correct
- Ensure your agent has been delegated to this space
- Check that your space still exists in your Storacha account

### CORS Errors in Browser
- Verify `CORS_ORIGINS` includes your frontend URL
- Check that both proxy and frontend are running
- Clear browser cache and retry

## Production Deployment

For production deployment:

1. Use environment variables from your hosting provider (don't commit `.env`)
2. Set `CORS_ORIGINS` to your production frontend domain(s)
3. Add HTTPS (use a reverse proxy like nginx or deploy to platforms that provide SSL)
4. Consider adding:
   - Rate limiting (e.g., `express-rate-limit`)
   - Request authentication
   - File content-type validation
   - Monitoring and logging

Example production `.env`:
```env
PORT=8787
W3UP_SPACE_DID=did:key:z6Mkk...
W3UP_AGENT={"did":"...","keys":{...},"proofs":[...]}
CORS_ORIGINS=https://yourapp.com,https://www.yourapp.com
```

## License

MIT - See LICENSE file in repository root
