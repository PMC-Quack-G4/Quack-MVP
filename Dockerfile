FROM node:20-alpine AS builder

WORKDIR /app

# Archivos de configuración de npm y pnpm si existen
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install

# Copiar configuración de Vite y Tailwind
COPY postcss.config.js tailwind.config.js vite.config.ts tsconfig*.json ./

# Copiar el código fuente
COPY index.html ./
COPY public/ ./public/
COPY src/ ./src/

# Construir la aplicación para producción
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar configuración de nginx
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copiar archivos compilados
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
