FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml* ./

RUN pnpm install --no-frozen-lockfile

COPY . .

#  Copiar las claves JWT a la raíz (NO a dist aún)
COPY jwt-keys ./jwt-keys/

RUN pnpm run build

#  Después del build, copiar las claves a dist
RUN mkdir -p dist/jwt-keys && cp -r jwt-keys/* dist/jwt-keys/

RUN pnpm prune --prod

FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/jwt-keys ./jwt-keys

EXPOSE 3003

CMD ["node", "dist/main.js"]