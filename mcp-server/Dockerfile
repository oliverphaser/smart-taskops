FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV API_BASE_URL=http://api-gateway:4000/api/v1
ENV MCP_TRANSPORT=http
ENV MCP_PORT=4100
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 4100
CMD ["node", "dist/server.js"]
