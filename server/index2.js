console.log('index.js starting');
 
const { PORT } = require('./config');
const express = require('express');
const cors = require('cors');
const db = require('./db/db');
const analyticsRouter = require('./routes/analytics');
const app = express();
 
app.use(cors());
app.use(express.json());
 
app.get('/', (req, res) => {
  res.send('API running');
});
 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});