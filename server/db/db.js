console.log("1: db.js started");

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

console.log("2: modules loaded");

const path = require('path');

const schemaPath = path.join(__dirname, 'schema.sql');
const dbPath = path.join(__dirname, 'database.db')

// module load will block the event loop and will throw an error if the file is missing
// will wrap it in a try/catch or moving schema loading into an explicit startup/init step with clearer error handling
const schema = fs.readFileSync(schemaPath, 'utf8');

console.log("3: schema loaded");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('error connecting to database'); // despite error leads to else statement which exports db object > put in error or failing process so rest of the app doesn't run against an unstable database handle
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