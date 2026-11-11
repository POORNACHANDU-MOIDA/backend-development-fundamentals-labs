# Lab 3: REST API Test Results

**Student:** M.POORNA CHANDU | **Reg:** 252U1R9099 | **Section:** CSE-GEN AI -2B
**Date:** 2026-11-11T15:33:50.917Z

## Test Summary

| # | Test Scenario | Method | Endpoint / Query | Expected | Actual Status | Result |
| :-: | :--- | :---: | :--- | :---: | :---: | :---: |
| 1 | GET all books (default limit 10, offset 0, order id ASC) | `GET` | `/books/` | `200` | `200 OK` | PASS |
| 2 | GET search by title partial match (?search_q=Clean) | `GET` | `/books/?search_q=Clean` | `200` | `200 OK` | PASS |
| 3 | GET search by title (?search_q=JavaScript) | `GET` | `/books/?search_q=JavaScript` | `200` | `200 OK` | PASS |
| 4 | GET sort by price descending (?order_by=price&order=DESC) | `GET` | `/books/?order_by=price&order=DESC` | `200` | `200 OK` | PASS |
| 5 | GET sort by pages ascending (?order_by=pages&order=ASC) | `GET` | `/books/?order_by=pages&order=ASC` | `200` | `200 OK` | PASS |
| 6 | GET pagination limit=3, offset=0 | `GET` | `/books/?limit=3&offset=0` | `200` | `200 OK` | PASS |
| 7 | GET pagination limit=3, offset=3 | `GET` | `/books/?limit=3&offset=3` | `200` | `200 OK` | PASS |
| 8 | GET price range filter (?min_price=500&max_price=700) | `GET` | `/books/?min_price=500&max_price=700` | `200` | `200 OK` | PASS |
| 9 | GET minimum price filter (?min_price=700) | `GET` | `/books/?min_price=700` | `200` | `200 OK` | PASS |
| 10 | GET maximum price filter (?max_price=350) | `GET` | `/books/?max_price=350` | `200` | `200 OK` | PASS |
| 11 | GET combined search, filter, sort & pagination | `GET` | `/books/?search_q=Patterns&min_price=500&max_price=650&order_by=price&order=ASC&limit=5` | `200` | `200 OK` | PASS |
| 12 | GET invalid limit parameter (negative number -> 400) | `GET` | `/books/?limit=-5` | `400` | `400 Bad Request` | PASS |
| 13 | GET invalid min_price (non-numeric -> 400) | `GET` | `/books/?min_price=abc` | `400` | `400 Bad Request` | PASS |
| 14 | GET invalid price range (min_price > max_price -> 400) | `GET` | `/books/?min_price=800&max_price=400` | `400` | `400 Bad Request` | PASS |
| 15 | GET single book by valid ID (/books/1/) | `GET` | `/books/1/` | `200` | `200 OK` | PASS |
| 16 | GET book by nonexistent ID (/books/999/ -> 404) | `GET` | `/books/999/` | `404` | `404 Not Found` | PASS |
| 17 | GET book with invalid non-integer ID (/books/abc/ -> 400) | `GET` | `/books/abc/` | `400` | `400 Bad Request` | PASS |
| 18 | GET book with SQL injection attempt (/books/1%20OR%201=1/ -> 400) | `GET` | `/books/1%20OR%201=1/` | `400` | `400 Bad Request` | PASS |
| 19 | POST create new book (valid payload -> 201) | `POST` | `/books/` | `201` | `201 Created` | PASS |
| 20 | POST reject missing title (400 Bad Request) | `POST` | `/books/` | `400` | `400 Bad Request` | PASS |
| 21 | POST reject missing author (400 Bad Request) | `POST` | `/books/` | `400` | `400 Bad Request` | PASS |
| 22 | POST reject non-numeric price (400 Bad Request) | `POST` | `/books/` | `400` | `400 Bad Request` | PASS |
| 23 | PUT update existing book (/books/1/ -> 200) | `PUT` | `/books/1/` | `200` | `200 OK` | PASS |
| 24 | PUT update nonexistent book (/books/999/ -> 404) | `PUT` | `/books/999/` | `404` | `404 Not Found` | PASS |
| 25 | DELETE newly created book (uses dynamic createdBookId -> 200) | `DELETE` | `/books/17/` | `200` | `200 OK` | PASS |
| 26 | DELETE nonexistent book (/books/999/ -> 404) | `DELETE` | `/books/999/` | `404` | `404 Not Found` | PASS |

## Detailed Request & Response Logs

### 1. GET all books (default limit 10, offset 0, order id ASC)

- **Method:** `GET`
- **Path:** `/books/`
- **Status:** `200 OK`
- **Response Body:**
```json
[
  {
    "id": 1,
    "title": "Clean Code: A Handbook of Agile Software Craftsmanship (2nd Ed)",
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

### 2. GET search by title partial match (?search_q=Clean)

- **Method:** `GET`
- **Path:** `/books/?search_q=Clean`
- **Status:** `200 OK`
- **Response Body:**
```json
[
  {
    "id": 1,
    "title": "Clean Code: A Handbook of Agile Software Craftsmanship (2nd Ed)",
    "author": "Robert C. Martin",
    "price": 499,
    "pages": 464
  }
]
```

### 3. GET search by title (?search_q=JavaScript)

- **Method:** `GET`
- **Path:** `/books/?search_q=JavaScript`
- **Status:** `200 OK`
- **Response Body:**
```json
[
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
  }
]
```

### 4. GET sort by price descending (?order_by=price&order=DESC)

- **Method:** `GET`
- **Path:** `/books/?order_by=price&order=DESC`
- **Status:** `200 OK`
- **Response Body:**
```json
[
  {
    "id": 4,
    "title": "Introduction to Algorithms",
    "author": "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
    "price": 850,
    "pages": 1312
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
  },
  {
    "id": 3,
    "title": "Design Patterns",
    "author": "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
    "price": 600,
    "pages": 395
  },
  {
    "id": 8,
    "title": "Refactoring",
    "author": "Martin Fowler",
    "price": 550,
    "pages": 448
  },
  {
    "id": 2,
    "title": "The Pragmatic Programmer",
    "author": "Andrew Hunt and David Thomas",
    "price": 520,
    "pages": 352
  },
  {
    "id": 1,
    "title": "Clean Code: A Handbook of Agile Software Craftsmanship (2nd Ed)",
    "author": "Robert C. Martin",
    "price": 499,
    "pages": 464
  },
  {
    "id": 6,
    "title": "Eloquent JavaScript",
    "author": "Marijn Haverbeke",
    "price": 380,
    "pages": 472
  },
  {
    "id": 5,
    "title": "You Don't Know JS: Scope & Closures",
    "author": "Kyle Simpson",
    "price": 300,
    "pages": 98
  },
  {
    "id": 7,
    "title": "JavaScript: The Good Parts",
    "author": "Douglas Crockford",
    "price": 280,
    "pages": 176
  }
]
```

### 5. GET sort by pages ascending (?order_by=pages&order=ASC)

- **Method:** `GET`
- **Path:** `/books/?order_by=pages&order=ASC`
- **Status:** `200 OK`
- **Response Body:**
```json
[
  {
    "id": 5,
    "title": "You Don't Know JS: Scope & Closures",
    "author": "Kyle Simpson",
    "price": 300,
    "pages": 98
  },
  {
    "id": 7,
    "title": "JavaScript: The Good Parts",
    "author": "Douglas Crockford",
    "price": 280,
    "pages": 176
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
    "id": 8,
    "title": "Refactoring",
    "author": "Martin Fowler",
    "price": 550,
    "pages": 448
  },
  {
    "id": 1,
    "title": "Clean Code: A Handbook of Agile Software Craftsmanship (2nd Ed)",
    "author": "Robert C. Martin",
    "price": 499,
    "pages": 464
  },
  {
    "id": 6,
    "title": "Eloquent JavaScript",
    "author": "Marijn Haverbeke",
    "price": 380,
    "pages": 472
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
  },
  {
    "id": 4,
    "title": "Introduction to Algorithms",
    "author": "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
    "price": 850,
    "pages": 1312
  }
]
```

### 6. GET pagination limit=3, offset=0

- **Method:** `GET`
- **Path:** `/books/?limit=3&offset=0`
- **Status:** `200 OK`
- **Response Body:**
```json
[
  {
    "id": 1,
    "title": "Clean Code: A Handbook of Agile Software Craftsmanship (2nd Ed)",
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
  }
]
```

### 7. GET pagination limit=3, offset=3

- **Method:** `GET`
- **Path:** `/books/?limit=3&offset=3`
- **Status:** `200 OK`
- **Response Body:**
```json
[
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
  }
]
```

### 8. GET price range filter (?min_price=500&max_price=700)

- **Method:** `GET`
- **Path:** `/books/?min_price=500&max_price=700`
- **Status:** `200 OK`
- **Response Body:**
```json
[
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
    "id": 8,
    "title": "Refactoring",
    "author": "Martin Fowler",
    "price": 550,
    "pages": 448
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

### 9. GET minimum price filter (?min_price=700)

- **Method:** `GET`
- **Path:** `/books/?min_price=700`
- **Status:** `200 OK`
- **Response Body:**
```json
[
  {
    "id": 4,
    "title": "Introduction to Algorithms",
    "author": "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
    "price": 850,
    "pages": 1312
  },
  {
    "id": 9,
    "title": "Designing Data-Intensive Applications",
    "author": "Martin Kleppmann",
    "price": 750,
    "pages": 616
  }
]
```

### 10. GET maximum price filter (?max_price=350)

- **Method:** `GET`
- **Path:** `/books/?max_price=350`
- **Status:** `200 OK`
- **Response Body:**
```json
[
  {
    "id": 5,
    "title": "You Don't Know JS: Scope & Closures",
    "author": "Kyle Simpson",
    "price": 300,
    "pages": 98
  },
  {
    "id": 7,
    "title": "JavaScript: The Good Parts",
    "author": "Douglas Crockford",
    "price": 280,
    "pages": 176
  }
]
```

### 11. GET combined search, filter, sort & pagination

- **Method:** `GET`
- **Path:** `/books/?search_q=Patterns&min_price=500&max_price=650&order_by=price&order=ASC&limit=5`
- **Status:** `200 OK`
- **Response Body:**
```json
[
  {
    "id": 3,
    "title": "Design Patterns",
    "author": "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
    "price": 600,
    "pages": 395
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

### 12. GET invalid limit parameter (negative number -> 400)

- **Method:** `GET`
- **Path:** `/books/?limit=-5`
- **Status:** `400 Bad Request`
- **Response Body:**
```json
{
  "message": "Query parameter 'limit' must be a positive integer."
}
```

### 13. GET invalid min_price (non-numeric -> 400)

- **Method:** `GET`
- **Path:** `/books/?min_price=abc`
- **Status:** `400 Bad Request`
- **Response Body:**
```json
{
  "message": "Query parameter 'min_price' must be a non-negative number."
}
```

### 14. GET invalid price range (min_price > max_price -> 400)

- **Method:** `GET`
- **Path:** `/books/?min_price=800&max_price=400`
- **Status:** `400 Bad Request`
- **Response Body:**
```json
{
  "message": "Query parameter 'min_price' cannot be greater than 'max_price'."
}
```

### 15. GET single book by valid ID (/books/1/)

- **Method:** `GET`
- **Path:** `/books/1/`
- **Status:** `200 OK`
- **Response Body:**
```json
{
  "id": 1,
  "title": "Clean Code: A Handbook of Agile Software Craftsmanship (2nd Ed)",
  "author": "Robert C. Martin",
  "price": 499,
  "pages": 464
}
```

### 16. GET book by nonexistent ID (/books/999/ -> 404)

- **Method:** `GET`
- **Path:** `/books/999/`
- **Status:** `404 Not Found`
- **Response Body:**
```json
{
  "message": "Book not found"
}
```

### 17. GET book with invalid non-integer ID (/books/abc/ -> 400)

- **Method:** `GET`
- **Path:** `/books/abc/`
- **Status:** `400 Bad Request`
- **Response Body:**
```json
{
  "message": "Invalid book ID. Must be a positive integer."
}
```

### 18. GET book with SQL injection attempt (/books/1%20OR%201=1/ -> 400)

- **Method:** `GET`
- **Path:** `/books/1%20OR%201=1/`
- **Status:** `400 Bad Request`
- **Response Body:**
```json
{
  "message": "Invalid book ID. Must be a positive integer."
}
```

### 19. POST create new book (valid payload -> 201)

- **Method:** `POST`
- **Path:** `/books/`
- **Request Body:**
```json
{
  "title": "Site Reliability Engineering",
  "author": "Betsy Beyer, Chris Jones, Jennifer Petoff, Niall Richard Murphy",
  "price": 720,
  "pages": 550
}
```
- **Status:** `201 Created`
- **Response Body:**
```json
{
  "message": "Book created successfully",
  "bookId": 17
}
```

### 20. POST reject missing title (400 Bad Request)

- **Method:** `POST`
- **Path:** `/books/`
- **Request Body:**
```json
{
  "author": "Anonymous Author",
  "price": 400,
  "pages": 200
}
```
- **Status:** `400 Bad Request`
- **Response Body:**
```json
{
  "message": "Field 'title' is required and must be a non-empty string."
}
```

### 21. POST reject missing author (400 Bad Request)

- **Method:** `POST`
- **Path:** `/books/`
- **Request Body:**
```json
{
  "title": "Book Without Author",
  "price": 400,
  "pages": 200
}
```
- **Status:** `400 Bad Request`
- **Response Body:**
```json
{
  "message": "Field 'author' is required and must be a non-empty string."
}
```

### 22. POST reject non-numeric price (400 Bad Request)

- **Method:** `POST`
- **Path:** `/books/`
- **Request Body:**
```json
{
  "title": "Invalid Price Book",
  "author": "Author",
  "price": "free",
  "pages": 200
}
```
- **Status:** `400 Bad Request`
- **Response Body:**
```json
{
  "message": "Field 'price' is required and must be a valid non-negative number."
}
```

### 23. PUT update existing book (/books/1/ -> 200)

- **Method:** `PUT`
- **Path:** `/books/1/`
- **Request Body:**
```json
{
  "title": "Clean Code: A Handbook of Agile Software Craftsmanship (2nd Ed)",
  "author": "Robert C. Martin",
  "price": 499,
  "pages": 464
}
```
- **Status:** `200 OK`
- **Response Body:**
```json
{
  "message": "Book updated successfully"
}
```

### 24. PUT update nonexistent book (/books/999/ -> 404)

- **Method:** `PUT`
- **Path:** `/books/999/`
- **Request Body:**
```json
{
  "title": "Ghost Book",
  "author": "Ghost Writer",
  "price": 300,
  "pages": 100
}
```
- **Status:** `404 Not Found`
- **Response Body:**
```json
{
  "message": "Book not found"
}
```

### 25. DELETE newly created book (uses dynamic createdBookId -> 200)

- **Method:** `DELETE`
- **Path:** `/books/17/`
- **Status:** `200 OK`
- **Response Body:**
```json
{
  "message": "Book deleted successfully"
}
```

### 26. DELETE nonexistent book (/books/999/ -> 404)

- **Method:** `DELETE`
- **Path:** `/books/999/`
- **Status:** `404 Not Found`
- **Response Body:**
```json
{
  "message": "Book not found"
}
```

