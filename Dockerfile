FROM node:14-alpine 
#Menggunakan base image Node.js versi 14

WORKDIR /app
#Menentukan bahwa working directory untuk container adalah /app

COPY . /app
#Menyalin seluruh source code ke working directory di container.

ENV NODE_ENV=production DB_HOST=item-db
#Menentukan agar aplikasi berjalan dalam production mode dan menggunakan container bernama item-dbsebagai database host

RUN npm install --production --unsafe-perm && npm run build
#Menginstal dependencies untuk production dan kemudian build aplikasi

EXPOSE 8080
#Ekspos bahwa port yang digunakan oleh aplikasi adalah 8080

CMD ["npm", "start"]
#Saat container diluncurkan, jalankan server dengan perintah npm start