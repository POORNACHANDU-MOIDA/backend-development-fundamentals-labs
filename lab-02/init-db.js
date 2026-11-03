// One-time helper script to initialize books.db from schema.sql
// Used because sqlite3 CLI is not installed by default on Windows.

const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "books.db");
const schemaPath = path.join(__dirname, "schema.sql");

// If existing books.db exists, remove it to start clean with seed data
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const sql = fs.readFileSync(schemaPath, "utf8");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to create database:", err.message);
    process.exit(1);
  }
});

db.exec(sql, (err) => {
  if (err) {
    console.error("Failed to execute schema.sql:", err.message);
    db.close();
    process.exit(1);
  }

  console.log("Database books.db initialized successfully from schema.sql");
  db.all("SELECT id, title, author, price, pages FROM book", [], (selectErr, rows) => {
    if (selectErr) {
      console.error("Failed to verify rows:", selectErr.message);
    } else {
      console.log(`Inserted ${rows.length} seed rows:`);
      rows.forEach((r) => console.log(`  [${r.id}] ${r.title} by ${r.author} (Rs.${r.price}, ${r.pages} pages)`));
    }
    db.close();
  });
});
