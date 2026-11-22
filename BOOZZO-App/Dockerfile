FROM node:22-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
ENV HOST=0.0.0.0 PORT=8080 DATA_DIR=/data
EXPOSE 8080
CMD ["node", "dev.mjs"]
