# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de configuração
COPY package.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Build
RUN npm run build

# Production stage
FROM nginx:alpine

# Copiar build do frontend
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
