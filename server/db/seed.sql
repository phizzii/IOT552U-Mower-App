PRAGMA foreign_keys = OFF;

BEGIN TRANSACTION;

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

INSERT INTO Customer (
  customer_id,
  first_name,
  last_name,
  phone_number,
  address_line_1,
  address_line_2,
  address_line_3,
  postcode
) VALUES
  (1, 'Alice', 'Carter', '07111111111', '12 Meadow Lane', 'Oakford', 'Devon', 'EX4 2AB'),
  (2, 'Ben', 'Turner', '07222222222', '44 Willow Drive', 'Ashbourne', 'Derbyshire', 'DE6 1CD'),
  (3, 'Chloe', 'Morgan', '07333333333', '7 Station Road', 'Kingsbridge', 'Devon', 'TQ7 1EF');

INSERT INTO Machine_Type (
  machine_type_id,
  type_name
) VALUES
  (1, 'Ride-on mower'),
  (2, 'Petrol lawn mower'),
  (3, 'Strimmer');

INSERT INTO Service (
  service_id,
  machine_type_id,
  service_description,
  price
) VALUES
  (1, 1, 'Ride-on annual service', 185.00),
  (2, 2, 'Petrol mower full service', 95.00),
  (3, 3, 'Strimmer service and tune-up', 65.00);

INSERT INTO Part (
  part_id,
  part_description,
  supplier_name,
  supplier_cost,
  retail_price
) VALUES
  (1, 'Drive shaft assembly', 'GreenField Parts Ltd', 42.50, 68.00),
  (2, 'Spark plug', 'MowerTech Supplies', 3.20, 7.50),
  (3, 'Blade set', 'CutRight Wholesale', 18.00, 32.00),
  (4, 'Air filter', 'MowerTech Supplies', 4.10, 9.00);

INSERT INTO Machine (
  machine_id,
  customer_id,
  machine_type_id,
  make,
  model_no,
  serial_no,
  other_no
) VALUES
  (1, 1, 2, 'Honda', 'HRX426', 'HON-426-001', NULL),
  (2, 2, 1, 'John Deere', 'X350', 'JD-X350-778', 'Deck 42'),
  (3, 3, 3, 'Stihl', 'FS55', 'STIHL-FS55-210', NULL);

INSERT INTO Repair_Job (
  job_no,
  customer_id,
  machine_id,
  date_logged,
  date_collected,
  instruction,
  notes,
  status,
  date_finished,
  contact_method,
  date_return
) VALUES
  (1, 1, 1, '2026-04-10', NULL, 'Customer requested standard service before summer use', 'Machine starts but runs rough after 10 minutes', 'In Progress', NULL, 'Phone', '2026-04-22'),
  (2, 2, 2, '2026-04-11', NULL, 'Replace damaged drive shaft and inspect deck', 'Customer reported loud knocking when engaging drive', 'Awaiting Parts', NULL, 'Email', NULL),
  (3, 3, 3, '2026-04-12', '2026-04-16', 'Service and return to customer', 'Completed same week', 'Collected', '2026-04-15', 'Phone', '2026-04-16');

INSERT INTO Job_Line_Item (
  line_item_id,
  job_id,
  service_id,
  description,
  labour_hours,
  hourly_rate,
  line_total
) VALUES
  (1, 1, 2, 'Petrol mower full service', 1.50, 45.00, 95.00),
  (2, 3, 3, 'Strimmer service and tune-up', 1.00, 45.00, 65.00),
  (3, 2, NULL, 'Labour to remove damaged drive shaft and fit replacement', 2.00, 45.00, 90.00);

INSERT INTO Job_Part (
  job_part_id,
  job_no,
  part_id,
  quantity,
  bill_no,
  bill_date,
  charge_price
) VALUES
  (1, 1, 2, 1, 'B-1001', '2026-04-10', 7.50),
  (2, 1, 4, 1, 'B-1002', '2026-04-10', 9.00),
  (3, 2, 1, 1, 'B-1003', '2026-04-11', 68.00),
  (4, 3, 2, 1, 'B-1004', '2026-04-12', 7.50);

INSERT INTO Sale_Item (
  sale_item_no,
  customer_id,
  make,
  model,
  type,
  details,
  price,
  date_sold,
  payment_type
) VALUES
  (1, 1, 'Mountfield', 'SP53', 'Petrol lawn mower', 'Ex-display mower sold with starter pack', 289.00, '2026-04-09', 'Card'),
  (2, 3, 'Stihl', 'AutoCut C6-2', 'Accessory', 'Replacement strimmer head', 24.99, '2026-04-14', 'Cash');

INSERT INTO Invoice (
  invoice_no,
  customer_id,
  job_no,
  sale_item_no,
  total_cost,
  payment_type,
  date_paid
) VALUES
  (1, 1, 1, NULL, 111.50, 'Card', NULL),
  (2, 2, 2, NULL, 158.00, 'Bank Transfer', NULL),
  (3, 3, 3, NULL, 72.50, 'Cash', '2026-04-16'),
  (4, 1, NULL, 1, 289.00, 'Card', '2026-04-09'),
  (5, 3, 3, 2, 97.49, 'Cash', '2026-04-16');

INSERT INTO Delivery (
  delivery_id,
  invoice_no,
  fuel_price_per_litre,
  driver_cost_per_hour,
  miles_to_address,
  time_to_address,
  charge
) VALUES
  (1, 3, 1.52, 18.00, 6.00, 0.50, 14.00),
  (2, 5, 1.52, 18.00, 4.00, 0.40, 10.00);

COMMIT;

PRAGMA foreign_keys = ON;
