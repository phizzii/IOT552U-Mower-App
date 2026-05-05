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

function ensurePartBrandColumn() {
  db.all('PRAGMA table_info(Part)', (tableError, columns) => {
    if (tableError) {
      console.error('Could not inspect Part table:', tableError.message);
      return;
    }

    const hasBrandColumn = columns.some((column) => column.name === 'brand');

    if (hasBrandColumn) {
      console.log('Database ready');
      return;
    }

    db.run('ALTER TABLE Part ADD COLUMN brand TEXT', (alterError) => {
      if (alterError) {
        console.error('Could not add Part.brand column:', alterError.message);
        return;
      }

      console.log('Database ready');
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

    ensurePartBrandColumn();
  });
});

module.exports = db;
