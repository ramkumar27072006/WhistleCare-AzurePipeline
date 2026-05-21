require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`WhistleCare API Server listening on port ${port}`);
});

// Handle unhandled rejections globally
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
