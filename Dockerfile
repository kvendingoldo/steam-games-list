# Multi-stage build for frontend and backend
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json ./
RUN npm install

# Build frontend
FROM base AS frontend-builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY index.html ./
COPY src ./src
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy necessary files
COPY --from=deps /app/node_modules ./node_modules
COPY --from=frontend-builder /app/dist ./dist
COPY server ./server
COPY package.json ./

# Expose ports
EXPOSE 3001

# Start both backend and serve frontend
CMD ["node", "server/index.js"]

