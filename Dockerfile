FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

FROM base AS deps
ENV NODE_ENV=development
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

FROM base AS runner
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
RUN apk add --no-cache curl bash 
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
