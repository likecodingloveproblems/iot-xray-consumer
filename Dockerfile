# Use official Node.js LTS image
FROM node:20-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 3000
