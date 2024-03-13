FROM node:20.11.0-alpine3.18

RUN apk --no-cache add curl

WORKDIR /app

COPY docker/run.sh /app
RUN chmod +x /app/run.sh

COPY package.json /app
COPY package-lock.json /app

RUN npm install --production
RUN npm install cross-env

COPY index.js /app

EXPOSE 3000

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD curl -f http://localhost:3000 || exit 1

CMD ["/app/run.sh"]
