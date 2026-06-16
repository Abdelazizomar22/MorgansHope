FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install && npm rebuild

COPY . .

RUN mkdir -p uploads data

EXPOSE 3000

CMD ["npm", "run", "dev:watch"]
