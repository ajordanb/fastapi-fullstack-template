FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
ARG GIT_SHA
ENV SENTRY_RELEASE=$GIT_SHA
RUN npm run build


FROM socialengine/nginx-spa:latest AS runner
COPY env.sh /
COPY .env /
COPY --from=builder /usr/src/app/dist /app
EXPOSE 80
CMD ["/bin/bash", "-c", "/env.sh && cp env-config.js /app/env-config.js && nginx"]