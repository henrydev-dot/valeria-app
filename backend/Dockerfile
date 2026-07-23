FROM node:20-alpine

# Çalışma dizinini oluştur
WORKDIR /app

# Bağımlılıkları kopyala ve kur
COPY package*.json ./
RUN npm install

# Uygulama kaynak kodlarını ve public (görseller) klasörünü kopyala
COPY . .

# TypeScript kodlarını derle
RUN npm run build

# 3000 portunu dışa aç
EXPOSE 3000

# Uygulamayı başlat
CMD ["npm", "start"]
