const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const routes = require('./routes');
const startCronJob = require('./cron/expireOrders');


// Load environment variables
dotenv.config();

// App instance
const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// Test route
app.get('/', (req, res) => {
  res.send('🎉 Backend server is running!');
});

app.use('/api', routes);

// Kết nối MongoDB
connectDB();

startCronJob();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
