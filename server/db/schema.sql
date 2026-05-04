-- schema for database
CREATE TABLE IF NOT EXISTS Customer (
    customer_id INTEGER PRIMARY KEY, --consider not using auto increment
    first_name TEXT,
    last_name TEXT,
    phone_number TEXT,
    address_line_1 TEXT,
    address_line_2 TEXT,
    address_line_3 TEXT,
    postcode TEXT
);

CREATE TABLE IF NOT EXISTS Machine_Type (
    machine_type_id INTEGER PRIMARY KEY,
    type_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Service (
    service_id INTEGER PRIMARY KEY,
    machine_type_id INTEGER,
    service_description TEXT,
    price REAL,
    FOREIGN KEY (machine_type_id) REFERENCES Machine_Type(machine_type_id)
);

CREATE TABLE IF NOT EXISTS Part (
  part_id INTEGER PRIMARY KEY,
  part_description TEXT,
  supplier_name TEXT,
  supplier_cost REAL,
  retail_price REAL
);

CREATE TABLE IF NOT EXISTS Machine (
  machine_id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  machine_type_id INTEGER,
  make TEXT,
  model_no TEXT,
  serial_no TEXT,
  other_no TEXT,
  FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
  FOREIGN KEY (machine_type_id) REFERENCES Machine_Type(machine_type_id)
);

CREATE TABLE IF NOT EXISTS Repair_Job (
  job_no INTEGER PRIMARY KEY,
  customer_id INTEGER,
  machine_id INTEGER,
  date_logged TEXT,
  date_collected TEXT,
  instruction TEXT,
  notes TEXT,
  status TEXT,
  assigned_mechanic TEXT,
  date_finished TEXT,
  contact_method TEXT,
  date_return TEXT,
  FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
  FOREIGN KEY (machine_id) REFERENCES Machine(machine_id)
);

CREATE TABLE IF NOT EXISTS Job_Line_Item (
  line_item_id INTEGER PRIMARY KEY,
  job_id INTEGER,
  service_id INTEGER,
  description TEXT,
  labour_hours REAL,
  hourly_rate REAL,
  line_total REAL,
  FOREIGN KEY (job_id) REFERENCES Repair_Job(job_no),
  FOREIGN KEY (service_id) REFERENCES Service(service_id)
);

CREATE TABLE IF NOT EXISTS Job_Part (
  job_part_id INTEGER PRIMARY KEY,
  job_no INTEGER,
  part_id INTEGER,
  quantity INTEGER,
  bill_no TEXT,
  bill_date TEXT,
  charge_price REAL,
  FOREIGN KEY (job_no) REFERENCES Repair_Job(job_no),
  FOREIGN KEY (part_id) REFERENCES Part(part_id)
);

CREATE TABLE IF NOT EXISTS Delivery (
  delivery_id INTEGER PRIMARY KEY,
  invoice_no INTEGER,
  fuel_price_per_litre REAL,
  driver_cost_per_hour REAL,
  miles_to_address REAL,
  time_to_address REAL,
  charge REAL,
  FOREIGN KEY (invoice_no) REFERENCES Invoice(invoice_no)
);

CREATE TABLE IF NOT EXISTS Sale_Item (
  sale_item_no INTEGER PRIMARY KEY,
  customer_id INTEGER,
  make TEXT,
  model TEXT,
  type TEXT,
  details TEXT,
  price REAL,
  date_sold TEXT,
  payment_type TEXT,
  FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
);

CREATE TABLE IF NOT EXISTS Invoice (
  invoice_no INTEGER PRIMARY KEY,
  customer_id INTEGER,
  job_no INTEGER,
  sale_item_no INTEGER,
  total_cost REAL,
  payment_type TEXT,
  date_paid TEXT,
  FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
  FOREIGN KEY (job_no) REFERENCES Repair_Job(job_no),
  FOREIGN KEY (sale_item_no) REFERENCES Sale_Item(sale_item_no)
);
