console.log("1: db.js started");

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

console.log("2: modules loaded");

const path = require('path');

const schemaPath = path.join(__dirname, 'schema.sql');
const dbPath = path.join(__dirname, 'database.db')

const schema = fs.readFileSync(schemaPath, 'utf8');

console.log("3: schema loaded");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('error connecting to database');
  }
  else
  {
    console.log('connected to sqlite database');
    // foreign keys must be enabled per connection
    db.run('PRAGMA foreign_keys = ON')
  }
});

db.exec(schema, (err) => {
  if (err) {
    console.error("Schema error:", err.message);
  } else {
    console.log("Database ready");
  }
});

module.exports = db;