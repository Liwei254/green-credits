FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S hardhat -u 1001

# Change ownership of the app directory
RUN chown -R hardhat:nodejs /app
USER hardhat

EXPOSE 8545

CMD ["npx", "hardhat", "node"]
