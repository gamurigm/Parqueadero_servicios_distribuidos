FROM node:20-alpine AS builder

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Instalar TODAS las dependencias (incluyendo devDependencies)
RUN pnpm install --no-frozen-lockfile

# Copiar código fuente
COPY . .

# Compilar la aplicación
RUN pnpm run build

# Limpiar dependencias de desarrollo (solo para producción)
RUN pnpm prune --prod

# Etapa de producción
FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

# Copiar node_modules (ya limpiado) y dist desde builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["node", "dist/main.js"]