# Крок 1: Збірка React-додатку
FROM node:20-alpine AS build

WORKDIR /app

# Встановлюємо залежності
COPY package*.json ./
RUN npm install

# Копіюємо решту коду і будуємо production-версію
COPY . .
RUN npm run build

# Крок 2: Сервінг білду через nginx
FROM nginx:1.25-alpine

# Копіюємо зібраний білд до nginx static folder
COPY --from=build /app/build /usr/share/nginx/html

# Опціонально: власний nginx.conf (якщо потрібно)
# COPY nginx.conf /etc/nginx/nginx.conf

# Відкриваємо порт 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]