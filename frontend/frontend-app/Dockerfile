# ---------- Etapa 1: Construcción de Angular ----------
FROM node:18 AS build
WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el código fuente
COPY . .

# Compilar Angular en modo producción
RUN npm run build -- --configuration=production

# ---------- Etapa 2: Servir con Nginx ----------
FROM nginx:alpine

# Copiamos la app compilada al directorio que sirve Nginx
COPY --from=build /app/dist/frontend-app /usr/share/nginx/html

# Exponer el puerto 80 (lo que se mapeará al 4200 en docker-compose)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

