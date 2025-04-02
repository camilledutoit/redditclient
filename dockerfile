# Stage 1: Build
FROM node:18-alpine3.18 AS builder

# Upgrade Alpine packages to their latest patched versions
RUN apk update && apk upgrade --no-cache

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code and build the app
COPY . .
RUN npm run build

#Run tests
RUN npm test

# Prune unnecessary dependencies
RUN npm prune --production

# Stage 2: Production
FROM nginx:1.25-alpine

# Upgrade Alpine packages to their latest patched versions
RUN apk update && apk upgrade --no-cache

# Copy built files from the builder stage to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Add a health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80 || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]