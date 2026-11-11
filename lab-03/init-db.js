// Lab 3: Database initialization script
// Safely creates and seeds books.db from schema.sql with automatic backup protection

const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "books.db");
const backupPath = path.join(__dirname, "books.db.backup");
const schemaPath = path.join(__dirname, "schema.sql");

// Safe backup before resetting
if (fs.existsSync(dbPath)) {
  fs.copyFileSync(dbPath, backupPath);
  console.log("Existing books.db backed up to books.db.backup");
  fs.unlinkSync(dbPath);
}

const sql = fs.readFileSync(schemaPath, "utf8");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to connect to database:", err.message);
    process.exit(1);
  }
});

db.exec(sql, (err) => {
  if (err) {
    console.error("Failed to execute schema.sql:", err.message);
    db.close();
    process.exit(1);
  }

  console.log("Lab 3 books.db initialized successfully from schema.sql");
  db.all("SELECT id, title, author, price, pages FROM book", [], (selectErr, rows) => {
    if (selectErr) {
      console.error("Failed to verify rows:", selectErr.message);
    } else {
      console.log(`Verified ${rows.length} seed records in table 'book':`);
      rows.forEach((r) =>
        console.log(`  [${r.id}] ${r.title} by ${r.author} (Rs.${r.price}, ${r.pages} pages)`)
      );
    }
    db.close();
  });
});

