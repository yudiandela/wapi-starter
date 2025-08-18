const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

// Konfigurasi dari environment variables
const APP_PORT = parseInt(process.env.PORT || '3000');

// Alternative Health check (tanpa Redis test)
function simpleHealthCheck() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: APP_PORT,
      path: '/check',
      method: 'GET',
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.setTimeout(3000);
    req.end();
  });
}

// Health check hanya cek HTTP server
simpleHealthCheck()
  .then(healthy => {
    if (healthy) {
      console.log('✅ Health check passed');
      process.exit(0);
    } else {
      console.error('❌ Health check failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Health check error:', error.message);
    process.exit(1);
  });

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Health check terminated');
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('Health check interrupted');
  process.exit(1);
});
