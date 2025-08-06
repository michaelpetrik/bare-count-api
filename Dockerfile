# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app

# Copy package files and install production deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built app and static files
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --chown=node:node ./tracker.js ./tracker.js

# Switch to non-root user
USER node

# Expose port (use environment variable or default to 3000)
EXPOSE ${PORT:-3000}

# Simple health check using environment variable
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD node -e "const port=process.env.PORT||3000;require('http').get(\`http://localhost:\${port}/health\`,(r)=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# Start the application
CMD ["npm", "start"] 