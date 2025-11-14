# Use Node.js 18 LTS as base image
FROM node:18-bullseye

# Install additional tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    vim \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace

# Install global npm packages
RUN npm install -g npm@latest

# Default command
CMD ["bash"]
