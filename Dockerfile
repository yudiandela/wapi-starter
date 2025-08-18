# Gunakan Node.js official image sebagai base image
FROM node:22-alpine

# Set working directory di dalam container
WORKDIR /usr/src/app

# Copy package.json dan package-lock.json (jika ada)
COPY package*.json ./

# Install dependencies
RUN npm install

# Jika untuk production, gunakan npm ci untuk install yang lebih cepat
# RUN npm ci --only=production

# Copy kode aplikasi
COPY . .

# Buat user non-root untuk keamanan
RUN addgroup -g 1001 -S wapi
RUN adduser -S wapi -u 1001

# Ubah ownership file ke user wapi
RUN chown -R wapi:wapi /usr/src/app
USER wapi

# Expose port yang digunakan aplikasi
# EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Command untuk menjalankan aplikasi
CMD ["npm", "run", "start:prod"]

# Untuk development, gunakan:
# CMD ["npm", "run", "dev"]
