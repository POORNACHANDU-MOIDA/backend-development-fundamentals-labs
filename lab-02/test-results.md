# Lab 2: CRUD API Route Test Results

**Student:** M.POORNA CHANDU | **Reg:** 252U1R9099 | **Section:** CSE-GEN AI -2B
**Date:** 2026-11-12T08:56:06.838Z

## Test Summary

| # | Test Name | Method | Path | Expected | Actual Status | Result |
| :-: | :--- | :---: | :--- | :---: | :---: | :---: |
| 1 | GET all books | `GET` | `/books/` | `200` | `200 OK` | PASS |
| 2 | GET one book by valid ID | `GET` | `/books/1/` | `200` | `200 OK` | PASS |
| 3 | GET one book with non-existent ID (404) | `GET` | `/books/999/` | `404` | `404 Not Found` | PASS |
| 4 | GET one book with invalid non-integer ID (400) | `GET` | `/books/abc/` | `400` | `400 Bad Request` | PASS |
| 5 | GET one book with SQL-injection style ID (400) | `GET` | `/books/1%20OR%201=1/` | `400` | `400 Bad Request` | PASS |
| 6 | POST valid book (201 Created) | `POST` | `/books/` | `201` | `201 Created` | PASS |
| 7 | POST book with missing required fields (400 Bad Request) | `POST` | `/books/` | `400` | `400 Bad Request` | PASS |
| 8 | PUT update existing book (200 OK) | `PUT` | `/books/1/` | `200` | `200 OK` | PASS |
| 9 | PUT update non-existent book ID (404 Not Found) | `PUT` | `/books/999/` | `404` | `404 Not Found` | PASS |
| 10 | DELETE valid book ID (200 OK) | `DELETE` | `/books/11/` | `200` | `200 OK` | PASS |
| 11 | DELETE non-existent book ID (404 Not Found) | `DELETE` | `/books/999/` | `404` | `404 Not Found` | PASS |

## Detailed Request and Response Outputs

### 1. GET all books

**Command:**
```bash
curl -i http://localhost:3000/books/
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[
  {
    "id": 1,
    "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
    "author": "Robert C. Martin",
    "price": 499,
    "pages": 464
  },
  {
    "id": 2,
    "title": "The Pragmatic Programmer",
    "author": "Andrew Hunt and David Thomas",
    "price": 520,
    "pages": 352
  },
  {
    "id": 3,
    "title": "Design Patterns",
    "author": "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
    "price": 600,
    "pages": 395
  },
  {
    "id": 4,
    "title": "Introduction to Algorithms",
    "author": "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
    "price": 850,
    "pages": 1312
  },
  {
    "id": 5,
    "title": "You Don't Know JS: Scope & Closures",
    "author": "Kyle Simpson",
    "price": 300,
    "pages": 98
  },
  {
    "id": 6,
    "title": "Eloquent JavaScript",
    "author": "Marijn Haverbeke",
    "price": 380,
    "pages": 472
  },
  {
    "id": 7,
    "title": "JavaScript: The Good Parts",
    "author": "Douglas Crockford",
    "price": 280,
    "pages": 176
  },
  {
    "id": 8,
    "title": "Refactoring",
    "author": "Martin Fowler",
    "price": 550,
    "pages": 448
  },
  {
    "id": 9,
    "title": "Designing Data-Intensive Applications",
    "author": "Martin Kleppmann",
    "price": 750,
    "pages": 616
  },
  {
    "id": 10,
    "title": "Head First Design Patterns",
    "author": "Eric Freeman and Elisabeth Robson",
    "price": 620,
    "pages": 694
  }
]
```

### 2. GET one book by valid ID

**Command:**
```bash
curl -i http://localhost:3000/books/1/
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "id": 1,
  "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
  "author": "Robert C. Martin",
  "price": 499,
  "pages": 464
}
```

### 3. GET one book with non-existent ID (404)

**Command:**
```bash
curl -i http://localhost:3000/books/999/
```

**Response:**
```http
HTTP/1.1 404 Not Found
Content-Type: application/json; charset=utf-8

{
  "error": "Book not found"
}
```

### 4. GET one book with invalid non-integer ID (400)

**Command:**
```bash
curl -i http://localhost:3000/books/abc/
```

**Response:**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8

{
  "error": "Invalid book ID. Must be a positive integer."
}
```

### 5. GET one book with SQL-injection style ID (400)

**Command:**
```bash
curl -i "http://localhost:3000/books/1%20OR%201=1/"
```

**Response:**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8

{
  "error": "Invalid book ID. Must be a positive integer."
}
```

### 6. POST valid book (201 Created)

**Command:**
```bash
curl -i -X POST http://localhost:3000/books/ -H "Content-Type: application/json" -d '{"title":"Structure and Interpretation of Computer Programs","author":"Harold Abelson and Gerald Jay Sussman","price":650,"pages":657}'
```

**Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{
  "message": "Book created successfully",
  "bookId": 11
}
```

### 7. POST book with missing required fields (400 Bad Request)

**Command:**
```bash
curl -i -X POST http://localhost:3000/books/ -H "Content-Type: application/json" -d '{"title":"Incomplete Book Without Author or Price"}'
```

**Response:**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8

{
  "error": "Field 'author' is required and must be a non-empty string."
}
```

### 8. PUT update existing book (200 OK)

**Command:**
```bash
curl -i -X PUT http://localhost:3000/books/1/ -H "Content-Type: application/json" -d '{"title":"Clean Code: A Handbook of Agile Software Craftsmanship","author":"Robert C. Martin","price":499,"pages":464}'
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "message": "Book updated successfully"
}
```

### 9. PUT update non-existent book ID (404 Not Found)

**Command:**
```bash
curl -i -X PUT http://localhost:3000/books/999/ -H "Content-Type: application/json" -d '{"title":"Ghost Book","author":"Ghost Writer","price":250,"pages":150}'
```

**Response:**
```http
HTTP/1.1 404 Not Found
Content-Type: application/json; charset=utf-8

{
  "error": "Book not found"
}
```

### 10. DELETE valid book ID (200 OK)

**Command:**
```bash
curl -i -X DELETE http://localhost:3000/books/11/
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "message": "Book deleted successfully"
}
```

### 11. DELETE non-existent book ID (404 Not Found)

**Command:**
```bash
curl -i -X DELETE http://localhost:3000/books/999/
```

**Response:**
```http
HTTP/1.1 404 Not Found
Content-Type: application/json; charset=utf-8

{
  "error": "Book not found"
}
```

