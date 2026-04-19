require('dotenv').config();

const express = require('express');
const cors = require('cors');

const db = require('./db/db');
const customersRouter = require('./routes/customers');
const machineTypesRouter = require('./routes/machineTypes');
const partsRouter = require('./routes/parts');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API running');
});

app.use('/api/customers', customersRouter);
app.use('/api/machine-types', machineTypesRouter);
app.use('/api/parts', partsRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
