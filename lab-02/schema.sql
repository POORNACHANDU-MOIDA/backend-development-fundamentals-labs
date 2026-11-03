-- Lab 2: SQLite database schema and seed data
-- Table: book

CREATE TABLE IF NOT EXISTS book (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  price INTEGER NOT NULL,
  pages INTEGER NOT NULL
);

-- Seed rows (10 real, different books)
INSERT INTO book (title, author, price, pages) VALUES
  ('Clean Code', 'Robert C. Martin', 450, 464),
  ('The Pragmatic Programmer', 'Andrew Hunt and David Thomas', 520, 352),
  ('Design Patterns', 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', 600, 395),
  ('Introduction to Algorithms', 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein', 850, 1312),
  ('You Don''t Know JS: Scope & Closures', 'Kyle Simpson', 300, 98),
  ('Eloquent JavaScript', 'Marijn Haverbeke', 380, 472),
  ('JavaScript: The Good Parts', 'Douglas Crockford', 280, 176),
  ('Refactoring', 'Martin Fowler', 550, 448),
  ('Designing Data-Intensive Applications', 'Martin Kleppmann', 750, 616),
  ('Head First Design Patterns', 'Eric Freeman and Elisabeth Robson', 620, 694);
