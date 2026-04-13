console.log("1: db.js started");

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

console.log("2: modules loaded");

const schema = fs.readFileSync('./db/schema.sql', 'utf8');

console.log("3: schema loaded");

const db = new sqlite3.Database('./database.db');

db.exec(schema, (err) => {
  if (err) {
    console.error("Schema error:", err.message);
  } else {
    console.log("Database ready");
  }
});

module.exports = db;