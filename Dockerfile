FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Nota de seguridad: las variables sensibles (GEMINI_API_KEY, GEMINI_MODEL, GEMINI_LIVE_MODEL)
# se consumen únicamente en tiempo de ejecución desde el servidor/funciones `/api/*`
# y nunca se incrustan en el bundle estático del navegador.
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
