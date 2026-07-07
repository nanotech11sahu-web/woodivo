# WOODIVO Public Frontend — production image
# Vite bakes VITE_* env vars in at BUILD time, not runtime — pass
# --build-arg VITE_API_BASE_URL=https://api.yourdomain.com/api/v1 when
# building this image (docker-compose.yml already does this from .env).
# Changing the API URL later means rebuilding this image, not just
# restarting the container.

# ---- Stage 1: build ----
FROM node:22-alpine AS build
WORKDIR /app

ARG VITE_API_BASE_URL=http://localhost:4000/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Stage 2: serve with nginx ----
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

EXPOSE 80
