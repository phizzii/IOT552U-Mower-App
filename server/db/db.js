const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'schema.sql');
const dbPath = path.join(__dirname, 'database.db');

const schema = fs.readFileSync(schemaPath, 'utf8');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to sqlite database');
  }
});

function migratePartTableRemoveBrand() {
  db.all('PRAGMA table_info(Part)', (tableError, columns) => {
    if (tableError) {
      console.error('Could not inspect Part table:', tableError.message);
      return;
    }

    const hasBrandColumn = columns.some((column) => column.name === 'brand');

    if (!hasBrandColumn) {
      console.log('Database ready');
      return;
    }

    db.serialize(() => {
      db.run('PRAGMA foreign_keys = OFF');
      db.exec(
        `
          BEGIN TRANSACTION;
          DROP TABLE IF EXISTS Part_new;
          CREATE TABLE Part_new (
            part_id INTEGER PRIMARY KEY,
            part_description TEXT,
            supplier_name TEXT,
            supplier_cost REAL,
            retail_price REAL
          );
          INSERT INTO Part_new (
            part_id,
            part_description,
            supplier_name,
            supplier_cost,
            retail_price
          )
          SELECT
            part_id,
            part_description,
            supplier_name,
            supplier_cost,
            retail_price
          FROM Part;
          DROP TABLE Part;
          ALTER TABLE Part_new RENAME TO Part;
          COMMIT;
        `,
        (migrationError) => {
          db.run('PRAGMA foreign_keys = ON');

          if (migrationError) {
            console.error('Could not remove Part.brand column:', migrationError.message);
            return;
          }

          console.log('Database ready');
        }
      );
    });
  });
}

db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');
  db.exec(schema, (schemaError) => {
    if (schemaError) {
      console.error('Schema error:', schemaError.message);
      return;
    }

    migratePartTableRemoveBrand();
  });
});

module.exports = db;
