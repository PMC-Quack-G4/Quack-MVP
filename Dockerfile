FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_GEMINI_API_KEY
ARG VITE_GEMINI_MODEL=gemini-3.1-flash-lite
ARG VITE_GEMINI_LIVE_MODEL=gemini-3.8-live

ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
ENV VITE_GEMINI_MODEL=$VITE_GEMINI_MODEL
ENV VITE_GEMINI_LIVE_MODEL=$VITE_GEMINI_LIVE_MODEL

RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
