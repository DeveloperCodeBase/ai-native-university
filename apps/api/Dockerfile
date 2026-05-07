FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

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
CMD ["sh", "-c", "npx prisma migrate deploy 2>/dev/null; node dist/main"]
