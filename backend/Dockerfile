FROM node:20-alpine

WORKDIR /app

# Install deps first — separate layer so `npm ci` only reruns when package.json actually changes
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of the source
COPY . .

EXPOSE 5000

# Basic healthcheck hits the existing /api/health route
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "server.js"]