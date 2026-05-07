FROM node:20-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN npx next build

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"
CMD ["npx", "next", "start", "--port", "3000"]
