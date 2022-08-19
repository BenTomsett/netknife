# Install dependencies only when needed
FROM node:16.16.0-alpine AS deps
RUN apk add libc6-compat

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM node:16.16.0-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN yarn build

# Production image, copy all the files and run next
FROM node:16.16.0-alpine AS runner
RUN apk add bind-tools whois

WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 netknife
RUN adduser --system --uid 1001 netknife

COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=netknife:netknife /app/.next/standalone ./
COPY --from=builder --chown=netknife:netknife /app/.next/static ./.next/static

USER netknife

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
