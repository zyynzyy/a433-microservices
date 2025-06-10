FROM node:18-alpine
#Menggunakan image node versi 18 alpine

WORKDIR /app
# Set working directory di dalam container

COPY package*.json ./
RUN npm install
# Mengcopy file package.json dan package-lock.json ke dalam container

COPY . .
# Mengcopy semua file dari direktori lokal ke dalam container

ENV PORT=3000
EXPOSE 3000
# Mengatur environment variable PORT dan mengekspos port 3000

CMD ["node", "index.js"]
# Perintah untuk menjalankan aplikasi Node.js