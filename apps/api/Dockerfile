FROM node:20-alpine

WORKDIR /app

# Copy all config files
COPY package.json tsconfig.json nest-cli.json ./

# Install dependencies
RUN npm install

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code
COPY src ./src

# Build
RUN npx nest build

EXPOSE 4000

# Run migrations on start, then start the app
# NestJS outputs to dist/src/main.js because tsconfig includes both src/ and prisma/
CMD ["sh", "-c", "npx prisma migrate deploy 2>/dev/null; node dist/src/main.js"]
