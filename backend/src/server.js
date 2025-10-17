const app = require('./app');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await app.connect();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

// Export for serverless deployments or tests
module.exports = app;
