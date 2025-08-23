FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the React app for production (if build directory doesn't exist or is outdated)
RUN npm run build

# Install serve to run the production build
RUN npm install -g serve

# Set environment variables
ENV HOST=0.0.0.0

# Expose port 8080 (Cloud Run's default)
EXPOSE 8080

# Start the React app using serve on the PORT provided by Cloud Run
CMD ["sh", "-c", "serve -s build -l ${PORT:-8080}"]