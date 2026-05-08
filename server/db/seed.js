const db = require('./db');
 
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}
 
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}
 
function exec(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
 
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
 
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
 
function randomFloat(min, max, decimals = 2) {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}
 
function chance(probability) {
  return Math.random() < probability;
}
 
function weightedChoice(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let threshold = Math.random() * total;
 
  for (const item of items) {
    threshold -= item.weight;
    if (threshold <= 0) return item.value;
  }
 
  return items[items.length - 1].value;
}
 
function formatDate(date) {
  return date.toISOString().slice(0, 10);
}
 
function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
 
function randomDate(start, end) {
  const startMs = start.getTime();
  const endMs = end.getTime();
  const randomMs = randomInt(startMs, endMs);
  return new Date(randomMs);
}
 
function maskLastName(lastName) {
  if (!lastName) return '*';
  if (lastName.length === 1) return '*';
  if (lastName.length === 2) return `${lastName[0]}*`;
  return `${lastName[0]}${'*'.repeat(lastName.length - 2)}${lastName[lastName.length - 1]}`;
}
 
function maskPhone(phone) {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length <= 1) return '*';
  if (digits.length === 2) return `${digits[0]}*`;
  return `${digits[0]}${'*'.repeat(digits.length - 2)}${digits[digits.length - 1]}`;
}
 
async function seed() {
  try {
    console.log('Generating anonymised test data...');
 
    await exec(`
      DELETE FROM Delivery;
      DELETE FROM Invoice;
      DELETE FROM Job_Part;
      DELETE FROM Job_Line_Item;
      DELETE FROM Repair_Job;
      DELETE FROM Sale_Item;
      DELETE FROM Machine;
      DELETE FROM Service;
      DELETE FROM Part;
      DELETE FROM Machine_Type;
      DELETE FROM Customer;
    `);
 
    await exec(`
      DELETE FROM sqlite_sequence
      WHERE name IN (
        'Customer',
        'Machine_Type',
        'Service',
        'Part',
        'Machine',
        'Repair_Job',
        'Job_Line_Item',
        'Job_Part',
        'Delivery',
        'Sale_Item',
        'Invoice'
      );
    `).catch(() => {});
 
    const machineTypes = [
      'Ride-on mower',
      'Self-propelled mower',
      'Push mower',
      'Chainsaw',
      'Brush cutter',
      'Hedge cutter',
      'Pole hedge cutter',
      'Blower',
      'Tiller',
      'Pressure washer',
      'Cylinder mower',
      'Wacker plate',
    ];
 
    for (const typeName of machineTypes) {
      await run(
        `INSERT INTO Machine_Type (type_name) VALUES (?)`,
        [typeName]
      );
    }
 
    const machineTypeRows = await all(`SELECT * FROM Machine_Type`);
 
    const services = [
      ['Ride-on mower', 'Ride-on annual service', 185],
      ['Ride-on mower', 'Deck and drive inspection', 120],
      ['Self-propelled mower', 'Self-propelled mower full service', 95],
      ['Self-propelled mower', 'Drive system repair', 65],
      ['Push mower', 'Push mower service', 75],
      ['Push mower', 'Blade sharpen and balance', 35],
      ['Chainsaw', 'Chainsaw service and tune-up', 70],
      ['Chainsaw', 'Chain and bar maintenance', 45],
      ['Brush cutter', 'Brush cutter service', 55],
      ['Hedge cutter', 'Hedge cutter sharpen and service', 45],
      ['Pole hedge cutter', 'Pole hedge cutter service', 60],
      ['Blower', 'Blower service', 50],
      ['Tiller', 'Tiller get-going service', 60],
      ['Pressure washer', 'Pressure washer carb clean', 50],
      ['Cylinder mower', 'Cylinder mower service', 110],
      ['Wacker plate', 'Wacker plate inspection and repair', 65],
    ];
 
    for (const [machineTypeName, description, price] of services) {
      const machineType = machineTypeRows.find(
        (row) => row.type_name === machineTypeName
      );
 
      await run(
        `INSERT INTO Service (machine_type_id, service_description, price)
         VALUES (?, ?, ?)`,
        [machineType.machine_type_id, description, price]
      );
    }
 
    const parts = [
      ['Drive belt', 'Hayter', 'Garden Parts Direct', 18.5, 32],
      ['Spark plug', 'NGK', 'MowerTech Supplies', 3.2, 7.5],
      ['Blade set', 'Oregon', 'CutRight Wholesale', 18, 32],
      ['Air filter', 'Briggs & Stratton', 'MowerTech Supplies', 4.1, 9],
      ['Fuel pipe kit', 'Stihl', 'Garden Parts Direct', 6.5, 14],
      ['Carburettor', 'Walbro', 'Engine Spares UK', 22, 45],
      ['Recoil starter', 'Mountfield', 'Garden Parts Direct', 19, 38],
      ['Deck bearing', 'John Deere', 'Agri Supplies', 28, 55],
      ['Battery', 'Yuasa', 'Battery Store', 42, 75],
      ['Drive cable', 'Hayter', 'Garden Parts Direct', 9, 20],
      ['Gearbox', 'Hayter', 'Engine Spares UK', 95, 165],
      ['Ignition coil', 'Stihl', 'Engine Spares UK', 26, 52],
      ['Pull cord', 'Universal', 'ToolFix', 4, 10],
      ['Blade bolt', 'Universal', 'ToolFix', 2.5, 7],
      ['Fuel cap', 'MowerTech Supplies', 7, 15],
      ['Starter gear', 'Engine Spares UK', 16, 30],
      ['Tyre', 'Agri Supplies', 34, 60],
      ['Switch', 'ToolFix', 8, 18],
      ['Carb gasket set', 'Engine Spares UK', 5, 12],
      ['Muffler', 'Engine Spares UK', 27, 49],
    ];
 
    for (const [description, supplier, supplierCost, retailPrice] of parts) {
      await run(
        `INSERT INTO Part
          (part_description, supplier_name, supplier_cost, retail_price)
         VALUES (?, ?, ?, ?)`,
        [description, supplier, supplierCost, retailPrice]
      );
    }
 
    const firstNames = [
      'James', 'Sarah', 'Mark', 'Emma', 'David', 'Claire', 'Paul', 'Janet', 'Rob',
      'Laura', 'Tom', 'Sam', 'Ben', 'Jack', 'Amy', 'Luke', 'Eva', 'Gary', 'Billy',
      'Chriss', 'Lynne', 'Barbara', 'Keith', 'Wendy', 'Peter', 'Maria', 'Daniel',
      'Simon', 'Tony', 'Rachel', 'Anna', 'Megan', 'Oliver', 'Chris', 'Leah'
    ];
 
    const lastNames = [
      'Turner', 'Carter', 'Brown', 'Walker', 'Mason', 'Davies', 'Wilson', 'Taylor',
      'Thompson', 'King', 'White', 'Allen', 'Cooper', 'Bennett', 'Parker', 'Reed',
      'Cook', 'Morgan', 'Ward', 'Bell', 'Hill', 'Powell', 'Brooks', 'Harris',
      'Miller', 'Green', 'Foster', 'Evans', 'Scott', 'Jameson', 'Clark', 'Bailey'
    ];
 
    const streets = [
      'High Street',
      'Church Lane',
      'Mill Road',
      'Station Road',
      'The Paddock',
      'Rectory Lane',
      'Orchard Close',
      'Meadow View',
      'Oakfield Road',
      'Manor Close',
      'Pilgrims Way',
      'Rose Cottage Lane',
      'Forge Lane',
      'School Lane',
      'Birch Close'
    ];
 
 
    const locations = [
      { town: 'Maidstone', postcode: 'ME14 1HJ' },
      { town: 'Maidstone', postcode: 'ME14 2LQ' },
      { town: 'Maidstone', postcode: 'ME15 6YE' },
      { town: 'Maidstone', postcode: 'ME15 7UN' },
      { town: 'Barming', postcode: 'ME16 0GB' },
      { town: 'Barming', postcode: 'ME16 8RJ' },
      { town: 'West Malling', postcode: 'ME19 4AE' },
      { town: 'West Malling', postcode: 'ME19 6BJ' },
      { town: 'East Malling', postcode: 'ME19 6RA' },
      { town: 'East Malling', postcode: 'ME19 6SU' },
      { town: 'Aylesford', postcode: 'ME20 6PX' },
      { town: 'Aylesford', postcode: 'ME20 7NA' },
      { town: 'Ditton', postcode: 'ME20 6AH' },
      { town: 'Larkfield', postcode: 'ME20 6QN' },
      { town: 'Leybourne', postcode: 'ME19 5QS' },
      { town: 'Bearsted', postcode: 'ME14 4XX' },
      { town: 'Snodland', postcode: 'ME6 5SL' },
      { town: 'Snodland', postcode: 'ME6 5GT' }
    ];
 
    const makesByType = {
      'Ride-on mower': ['John Deere', 'Mountfield', 'Husqvarna', 'Countax', 'Toro'],
      'Self-propelled mower': ['Hayter', 'Honda', 'Mountfield', 'Toro', 'Masport'],
      'Push mower': ['Honda', 'Mountfield', 'Flymo', 'Webb', 'Bosch'],
      'Chainsaw': ['Stihl', 'Husqvarna', 'Echo'],
      'Brush cutter': ['Stihl', 'Husqvarna', 'Echo'],
      'Hedge cutter': ['Stihl', 'Honda', 'Echo'],
      'Pole hedge cutter': ['Stihl', 'Husqvarna'],
      'Blower': ['Stihl', 'Echo', 'Makita'],
      'Tiller': ['Honda', 'Camon', 'Mantis'],
      'Pressure washer': ['Karcher', 'Honda', 'Nilfisk'],
      'Cylinder mower': ['Allett', 'Atco', 'Webb'],
      'Wacker plate': ['Belle', 'Wacker Neuson', 'Altrad'],
    };
 
    const modelPrefixes = ['X', 'HRX', 'SP', 'FS', 'TS', 'BG', 'WP', 'CT', 'AT'];
 
    const paymentTypes = ['Cash', 'Card', 'Bank Transfer'];
 
    const contactMethods = ['Phone', 'SMS', 'WhatsApp'];
 
    const jobStatuses = [
      { value: 'Logged', weight: 0.16 },
      { value: 'In Progress', weight: 0.22 },
      { value: 'Awaiting Parts', weight: 0.14 },
      { value: 'Ready for Collection', weight: 0.16 },
      { value: 'Completed', weight: 0.10 },
      { value: 'Collected', weight: 0.22 },
    ];
 
    const instructions = [
      'Full annual service',
      'Not starting',
      'Running rough after 10 minutes',
      'Drive issue inspection',
      'Carb clean and tune-up',
      'Blade sharpen and balance',
      'Electrical issue diagnosis',
      'Recoil starter repair',
      'Deck belt issue',
      'Fuel system repair',
      'General get-going service',
      'Collection and workshop inspection',
    ];
 
    const notesPool = [
      'Customer requested quick turnaround.',
      'Requires follow-up once parts arrive.',
      'Machine tested after repair and now running correctly.',
      'Collected from customer address.',
      'Additional wear found during service.',
      'Customer advised on likely future maintenance.',
      'Awaiting approval before extra work.',
      'Seasonal service requested before summer use.',
    ];
 
    const customerCount = 35;
 
    for (let i = 0; i < customerCount; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = maskLastName(lastNames[i % lastNames.length]);
      const phone = maskPhone(`07${randomInt(100000000, 999999999)}`);
      const location = randomChoice(locations);
      const address1 = `${randomInt(1, 120)} ${randomChoice(streets)}`;
      const address2 = location.town;
      const address3 = 'Kent';
      const postcode = location.postcode;
      await run(
        `INSERT INTO Customer
          (first_name, last_name, phone_number, address_line_1, address_line_2, address_line_3, postcode)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [firstName, lastName, phone, address1, address2, address3, postcode]
      );
    }
 
    const customers = await all(`SELECT * FROM Customer`);
 
    const machineCount = 50;
 
    for (let i = 0; i < machineCount; i++) {
      const customer = randomChoice(customers);
      const machineType = randomChoice(machineTypeRows);
      const make = randomChoice(makesByType[machineType.type_name] || ['Generic']);
      const modelNo = `${randomChoice(modelPrefixes)}${randomInt(40, 999)}`;
      const serialNo = `${make.substring(0, 3).toUpperCase()}-${randomInt(1000, 9999)}-${randomInt(100, 999)}`;
      const otherNo = chance(0.3) ? `Deck ${randomInt(32, 54)}` : null;
 
      await run(
        `INSERT INTO Machine
          (customer_id, machine_type_id, make, model_no, serial_no, other_no)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [customer.customer_id, machineType.machine_type_id, make, modelNo, serialNo, otherNo]
      );
    }
 
    const machines = await all(`SELECT * FROM Machine`);
    const servicesRows = await all(`SELECT * FROM Service`);
    const partsRows = await all(`SELECT * FROM Part`);
 
    const jobCount = 110;
 
    for (let i = 0; i < jobCount; i++) {
      const machine = randomChoice(machines);
      const customer = customers.find((c) => c.customer_id === machine.customer_id);
      const status = weightedChoice(jobStatuses);
 
      const dateLogged = randomDate(new Date('2025-01-01'), new Date('2026-04-20'));
      const dateFinished =
        status === 'Completed' ||
        status === 'Collected' ||
        status === 'Ready for Collection'
          ? addDays(dateLogged, randomInt(1, 18))
          : chance(0.2)
          ? addDays(dateLogged, randomInt(2, 8))
          : null;
      
      const dateCollected =
        status === 'Collected' && dateFinished
          ? addDays(dateFinished, randomInt(0, 5))
          : null;
      
      const dateReturn =
        status === 'Collected'
          ? dateCollected
          : status === 'Ready for Collection'
          ? addDays(dateFinished, randomInt(0, 2))
          : chance(0.3)
          ? addDays(dateLogged, randomInt(2, 12))
          : null;
      
      await run(
        `INSERT INTO Repair_Job
          (customer_id, machine_id, date_logged, date_collected, instruction, notes, status,
          date_finished, contact_method, date_return)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customer.customer_id,
          machine.machine_id,
          formatDate(dateLogged),
          dateCollected ? formatDate(dateCollected) : null,
          randomChoice(instructions),
          chance(0.85) ? randomChoice(notesPool) : null,
          status,
          dateFinished ? formatDate(dateFinished) : null,
          randomChoice(contactMethods),
          dateReturn ? formatDate(dateReturn) : null,
        ]
      );
    }
 
    const jobs = await all(`SELECT * FROM Repair_Job`);
 
    for (const job of jobs) {
      const machine = machines.find((m) => m.machine_id === job.machine_id);
      const relevantServices = servicesRows.filter(
        (service) => service.machine_type_id === machine.machine_type_id
      );
 
      const lineItemCount = randomInt(1, 2);
 
      for (let i = 0; i < lineItemCount; i++) {
        const useCatalogService = chance(0.8) && relevantServices.length > 0;
        const service = useCatalogService ? randomChoice(relevantServices) : null;
        const labourHours = randomFloat(0.5, 3.5, 1);
        const hourlyRate = randomChoice([40, 45, 50, 55]);
        const lineTotal = service
          ? service.price
          : Number((labourHours * hourlyRate).toFixed(2));
        const description = service
          ? service.service_description
          : randomChoice([
              'Diagnostic labour',
              'Custom workshop labour',
              'Repair adjustment labour',
              'Strip down and rebuild labour',
            ]);
 
        await run(
          `INSERT INTO Job_Line_Item
            (job_id, service_id, description, labour_hours, hourly_rate, line_total)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [job.job_no, service ? service.service_id : null, description, labourHours, hourlyRate, lineTotal]
        );
      }
    }
 
    for (const job of jobs) {
      const partCount = chance(0.65) ? randomInt(0, 2) : 0;
 
      for (let i = 0; i < partCount; i++) {
        const part = randomChoice(partsRows);
        const quantity = randomInt(1, 2);
        const billDate = addDays(new Date(job.date_logged), randomInt(0, 7));
        const chargePrice = Number((part.retail_price * quantity).toFixed(2));
 
        await run(
          `INSERT INTO Job_Part
            (job_no, part_id, quantity, bill_no, bill_date, charge_price)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            job.job_no,
            part.part_id,
            quantity,
            `B-${randomInt(1000, 9999)}`,
            formatDate(billDate),
            chargePrice,
          ]
        );
      }
    }
 
    const saleTypes = ['Ride-on mower', 'Push mower', 'Accessory', 'Chainsaw', 'Brush cutter'];
    const saleItemCount = 14;
 
    for (let i = 0; i < saleItemCount; i++) {
      const customer = randomChoice(customers);
      const type = randomChoice(saleTypes);
      const make = randomChoice(['Stihl', 'Mountfield', 'Honda', 'Toro', 'John Deere']);
      const model = `${randomChoice(['SP', 'X', 'RMA', 'FS', 'BG'])}${randomInt(40, 500)}`;
      const details = randomChoice([
        'Refurbished machine sold with basic service',
        'Used machine sold in working condition',
        'Accessory sold alongside workshop repair',
        'Ex-display unit sold to repeat customer',
      ]);
      const price = randomChoice([24.99, 45, 89, 129, 219, 289, 349]);
      const dateSold = randomDate(new Date('2025-02-01'), new Date('2026-04-20'));
 
      await run(
        `INSERT INTO Sale_Item
          (customer_id, make, model, type, details, price, date_sold, payment_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [customer.customer_id, make, model, type, details, price, formatDate(dateSold), randomChoice(paymentTypes)]
      );
    }
 
    const lineItems = await all(`SELECT * FROM Job_Line_Item`);
    const jobParts = await all(`SELECT * FROM Job_Part`);
    const saleItems = await all(`SELECT * FROM Sale_Item`);
 
    for (const job of jobs) {
      const lineItemsForJob = lineItems.filter((li) => li.job_id === job.job_no);
      const partsForJob = jobParts.filter((jp) => jp.job_no === job.job_no);
 
      const lineTotal = lineItemsForJob.reduce((sum, item) => sum + (item.line_total || 0), 0);
      const partsTotal = partsForJob.reduce((sum, item) => sum + (item.charge_price || 0), 0);
      const hasDelivery = chance(0.22);
      const deliveryCharge = hasDelivery ? randomChoice([10, 12, 14, 18, 22, 30]) : 0;
      const totalCost = Number((lineTotal + partsTotal + deliveryCharge).toFixed(2));
      const paymentType = randomChoice(paymentTypes);
 
      const isPaid =
        job.status === 'Collected'
          ? chance(0.85)
          : job.status === 'Ready for Collection'
          ? chance(0.45)
          : job.status === 'Completed'
          ? chance(0.6)
          : chance(0.25);
 
      const paidDate =
        isPaid && (job.date_finished || job.date_logged)
          ? formatDate(addDays(new Date(job.date_finished || job.date_logged), randomInt(0, 7)))
          : null;
 
      const invoiceResult = await run(
        `INSERT INTO Invoice
          (customer_id, job_no, sale_item_no, total_cost, payment_type, date_paid)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [job.customer_id, job.job_no, null, totalCost, paymentType, paidDate]
      );
 
      if (hasDelivery) {
        const miles = randomFloat(1.5, 12, 1);
        const timeToAddress = Number((miles / randomChoice([18, 20, 24])).toFixed(2));
        const fuelPrice = randomChoice([1.49, 1.52, 1.55, 1.58, 1.61]);
        const driverRate = randomChoice([16, 18, 20]);
 
        await run(
          `INSERT INTO Delivery
            (invoice_no, fuel_price_per_litre, driver_cost_per_hour, miles_to_address, time_to_address, charge)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [invoiceResult.lastID, fuelPrice, driverRate, miles, timeToAddress, deliveryCharge]
        );
      }
    }
 
    for (const saleItem of saleItems) {
      await run(
        `INSERT INTO Invoice
          (customer_id, job_no, sale_item_no, total_cost, payment_type, date_paid)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          saleItem.customer_id,
          null,
          saleItem.sale_item_no,
          saleItem.price,
          saleItem.payment_type,
          chance(0.85) ? saleItem.date_sold : null,
        ]
      );
    }
 
    const counts = {
      customers: (await all(`SELECT COUNT(*) AS count FROM Customer`))[0].count,
      machines: (await all(`SELECT COUNT(*) AS count FROM Machine`))[0].count,
      jobs: (await all(`SELECT COUNT(*) AS count FROM Repair_Job`))[0].count,
      lineItems: (await all(`SELECT COUNT(*) AS count FROM Job_Line_Item`))[0].count,
      jobParts: (await all(`SELECT COUNT(*) AS count FROM Job_Part`))[0].count,
      saleItems: (await all(`SELECT COUNT(*) AS count FROM Sale_Item`))[0].count,
      invoices: (await all(`SELECT COUNT(*) AS count FROM Invoice`))[0].count,
      deliveries: (await all(`SELECT COUNT(*) AS count FROM Delivery`))[0].count,
    };
 
    console.log('Seed completed successfully with anonymised synthetic data.');
    console.log(counts);
 
    db.close((closeError) => {
      if (closeError) {
        console.error('Database close error:', closeError.message);
        process.exit(1);
      }
      process.exit(0);
    });
  } catch (error) {
    console.error('Seed error:', error.message);
    db.close(() => process.exit(1));
  }
}
 
seed();