# Usamos Node en Linux y una carpeta propia dentro de la imagen.
FROM node:24-bookworm-slim
WORKDIR /app

# npm ci instala en Linux las versiones del lockfile, incluido bcrypt.
# No copiamos el node_modules de Windows.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
ENV PUERTO=3000

# El proceso no necesita ejecutarse como root dentro del contenedor.
USER node
EXPOSE 3000
CMD ["node", "src/index.js"]
