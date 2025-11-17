FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S server -u 1001

# Change ownership of the app directory
RUN chown -R server:nodejs /app
USER server

EXPOSE 8787

CMD ["npm", "run", "start"]
