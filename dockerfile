FROM node:alpine

WORKDIR /usr/botwindpieces
COPY package*.json ./
RUN npm install -g pnpm
RUN pnpm install
COPY . .
CMD ["pnpm", "start"]

# Path: docker-compose.yml