const { PORT } = require('./config');

const express = require('express');
const cors = require('cors');

const db = require('./db/db');
const analyticsRouter = require('./routes/analytics');
const customersRouter = require('./routes/customers');
const deliveriesRouter = require('./routes/deliveries');
const invoicesRouter = require('./routes/invoices');
const machineTypesRouter = require('./routes/machineTypes');
const jobLineItemsRouter = require('./routes/jobLineItems');
const jobPartsRouter = require('./routes/jobParts');
const machinesRouter = require('./routes/machines');
const partsRouter = require('./routes/parts');
const repairJobsRouter = require('./routes/repairJobs');
const saleItemsRouter = require('./routes/saleItems');
const servicesRouter = require('./routes/services');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API running');
});

app.use('/api/analytics', analyticsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/deliveries', deliveriesRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/job-line-items', jobLineItemsRouter);
app.use('/api/job-parts', jobPartsRouter);
app.use('/api/machine-types', machineTypesRouter);
app.use('/api/machines', machinesRouter);
app.use('/api/parts', partsRouter);
app.use('/api/repair-jobs', repairJobsRouter);
app.use('/api/sale-items', saleItemsRouter);
app.use('/api/services', servicesRouter);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
