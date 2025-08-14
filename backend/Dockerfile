FROM node:18-alpine

WORKDIR /usr/src/app

# Copiar apenas os arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar apenas o diretório backend e os arquivos necessários
COPY backend/ ./backend/
COPY app.js ./
COPY Servidor.js ./
COPY .env* ./

EXPOSE 3000

ENV NODE_ENV=development

CMD ["npm", "run", "dev"]