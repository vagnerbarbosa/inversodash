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

# Instalar avahi-daemon para mDNS
RUN apk add --no-cache \
    avahi \
    avahi-tools \
    dbus \
    && mkdir -p /var/run/dbus \
    && mkdir -p /var/run/avahi-daemon

# Criar service file para anunciar inversodash.local
COPY avahi/inversodash.service /etc/avahi/services/inversodash.service

# Criar script de inicialização
COPY avahi/start.sh /start.sh
RUN chmod +x /start.sh

# Copiar build do frontend
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor portas
EXPOSE 80

# Iniciar serviços
CMD ["/start.sh"]
