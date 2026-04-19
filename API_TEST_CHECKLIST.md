# API Test Checklist

Base URL:
`http://localhost:3001`

Before testing:
1. Start the server from `/Users/sophieb/Visual Studio Code/IOT552U-Mower-App/server`
2. Run `npm run seed` from `/Users/sophieb/Visual Studio Code/IOT552U-Mower-App/server`
3. Use Thunder Client or Postman to test the routes below

Seeded reference data:
- Customers: `1`, `2`, `3`
- Machine types: `1`, `2`, `3`
- Parts: `1`, `2`, `3`, `4`
- Machines: `1`, `2`, `3`
- Repair jobs: `1`, `2`, `3`
- Sale items: `1`, `2`
- Invoices: `1`, `2`, `3`, `4`, `5`

## 1. Core Lookups

### Customers
- `GET /api/customers`
- `GET /api/customers/1`
- `POST /api/customers`

```json
{
  "first_name": "Daniel",
  "last_name": "Reed",
  "phone_number": "07444444444",
  "address_line_1": "18 Brook Street",
  "address_line_2": "Totnes",
  "address_line_3": "Devon",
  "postcode": "TQ9 5AB"
}
```

- `PUT /api/customers/1`

```json
{
  "first_name": "Alice",
  "last_name": "Carter",
  "phone_number": "07111111111",
  "address_line_1": "12 Meadow Lane",
  "address_line_2": "Oakford",
  "address_line_3": "Devon",
  "postcode": "EX4 2ZZ"
}
```

- `DELETE /api/customers/999`
Expected: `404`

### Machine Types
- `GET /api/machine-types`
- `GET /api/machine-types/1`
- `POST /api/machine-types`

```json
{
  "type_name": "Electric mower"
}
```

### Parts
- `GET /api/parts`
- `GET /api/parts/1`
- `POST /api/parts`

```json
{
  "part_description": "Fuel filter",
  "supplier_name": "MowerTech Supplies",
  "supplier_cost": 4.25,
  "retail_price": 8.5
}
```

## 2. Customer Asset Setup

### Machines
- `GET /api/machines`
- `GET /api/machines/1`
- `POST /api/machines`

```json
{
  "customer_id": 1,
  "machine_type_id": 2,
  "make": "Hayter",
  "model_no": "Harrier 41",
  "serial_no": "HAY-41-900",
  "other_no": null
}
```

### Services
- `GET /api/services`
- `GET /api/services/1`
- `POST /api/services`

```json
{
  "machine_type_id": 2,
  "service_description": "Blade sharpen and balance",
  "price": 35
}
```

## 3. Repair Job Flow

### Repair Jobs
- `GET /api/repair-jobs`
- `GET /api/repair-jobs/1`
- `POST /api/repair-jobs`

```json
{
  "customer_id": 1,
  "machine_id": 1,
  "date_logged": "2026-04-19",
  "date_collected": null,
  "instruction": "Full inspection and service",
  "notes": "Customer said the mower loses power after 15 minutes",
  "status": "Logged",
  "date_finished": null,
  "contact_method": "Phone",
  "date_return": "2026-04-26"
}
```

### Job Line Items
- `GET /api/job-line-items`
- `GET /api/job-line-items/1`
- `POST /api/job-line-items`

```json
{
  "job_id": 1,
  "service_id": 2,
  "description": "Petrol mower full service",
  "labour_hours": 1.5,
  "hourly_rate": 45,
  "line_total": 95
}
```

Optional custom labour line without a service from the fixed list:

```json
{
  "job_id": 2,
  "service_id": null,
  "description": "Strip down and fit replacement drive shaft",
  "labour_hours": 2,
  "hourly_rate": 45,
  "line_total": 90
}
```

### Job Parts
- `GET /api/job-parts`
- `GET /api/job-parts/1`
- `POST /api/job-parts`

```json
{
  "job_no": 2,
  "part_id": 1,
  "quantity": 1,
  "bill_no": "B-2001",
  "bill_date": "2026-04-19",
  "charge_price": 68
}
```

## 4. Sales Flow

### Sale Items
- `GET /api/sale-items`
- `GET /api/sale-items/1`
- `POST /api/sale-items`

```json
{
  "customer_id": 2,
  "make": "Stihl",
  "model": "RMA 235",
  "type": "Electric mower",
  "details": "Battery mower sold with charger",
  "price": 219,
  "date_sold": "2026-04-19",
  "payment_type": "Card"
}
```

## 5. Billing Flow

### Invoices
- `GET /api/invoices`
- `GET /api/invoices/1`

Job-only invoice:

```json
{
  "customer_id": 1,
  "job_no": 1,
  "sale_item_no": null,
  "total_cost": 111.5,
  "payment_type": "Card",
  "date_paid": null
}
```

Sale-only invoice:

```json
{
  "customer_id": 2,
  "job_no": null,
  "sale_item_no": 1,
  "total_cost": 289,
  "payment_type": "Card",
  "date_paid": "2026-04-19"
}
```

Invoice with both a repair job and sale item:

```json
{
  "customer_id": 3,
  "job_no": 3,
  "sale_item_no": 2,
  "total_cost": 97.49,
  "payment_type": "Cash",
  "date_paid": "2026-04-16"
}
```

Validation check:
- `POST /api/invoices` with only `customer_id`
Expected: `400` because at least one of `job_no` or `sale_item_no` is required

### Deliveries
- `GET /api/deliveries`
- `GET /api/deliveries/1`
- `POST /api/deliveries`

```json
{
  "invoice_no": 1,
  "fuel_price_per_litre": 1.52,
  "driver_cost_per_hour": 18,
  "miles_to_address": 5.5,
  "time_to_address": 0.45,
  "charge": 12
}
```

## 6. Validation Checks

Run these on purpose and confirm the API rejects them:

- `GET /api/customers/abc`
Expected: `400`

- `POST /api/machines`

```json
{
  "customer_id": "x",
  "machine_type_id": 2
}
```

Expected: `400`

- `POST /api/services`

```json
{
  "machine_type_id": 2,
  "service_description": "Invalid price test",
  "price": -1
}
```

Expected: `400`

- `POST /api/job-parts`

```json
{
  "job_no": 1,
  "part_id": 1,
  "quantity": 0
}
```

Expected: `400`

- `POST /api/repair-jobs`

```json
{
  "customer_id": 1,
  "machine_id": 1,
  "date_logged": "19-04-2026"
}
```

Expected: `400`

## 7. Suggested Demo Flow

Use this order during demos:
1. Show `GET /api/customers`
2. Show `GET /api/machines`
3. Show `GET /api/repair-jobs`
4. Show `GET /api/job-line-items`
5. Show `GET /api/job-parts`
6. Show `GET /api/invoices`
7. Show `GET /api/deliveries`

That tells the story from customer -> machine -> repair -> billing.
