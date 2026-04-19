const fs = require('fs');
const path = require('path');

const db = require('./db');

const seedPath = path.join(__dirname, 'seed.sql');
const seedSql = fs.readFileSync(seedPath, 'utf8');

db.exec(seedSql, (err) => {
  if (err) {
    console.error('Seed error:', err.message);
    db.close();
    process.exit(1);
  }

  console.log('Seed data inserted successfully');

  db.close((closeError) => {
    if (closeError) {
      console.error('Database close error:', closeError.message);
      process.exit(1);
    }

    process.exit(0);
  });
});
