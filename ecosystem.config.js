module.exports = {
  apps: [
    {
      name: 'Wapi Starter',
      port: process.env.PORT,
      instances: 1,
      script: './dist/main.js',
    },
  ],
};
