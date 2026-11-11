// Lab 3: REST API, query parameters, validation, debugging
// Student: M.POORNA CHANDU (252U1R9099), Section: CSE-GEN AI -2B
// Faculty: Joel Prashanth D · Backend Development Fundamentals

const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const dbPath = path.join(__dirname, "books.db");

let db = null;

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Helper function to send consistent JSON error responses
function sendError(response, statusCode, message) {
  return response.status(statusCode).json({ message });
}

// Helper to validate positive integer book IDs (e.g. 1, 2, 3...)
function isValidPositiveInteger(value) {
  return /^[1-9]\d*$/.test(String(value).trim());
}

// Helper to validate request payload for POST and PUT
function validateBookPayload(body) {
  if (!body || typeof body !== "object") {
    return "Request body must be a valid JSON object.";
  }

  const { title, author, price, pages } = body;

  // Title validation
  if (typeof title !== "string" || title.trim() === "") {
    return "Field 'title' is required and must be a non-empty string.";
  }

  // Author validation
  if (typeof author !== "string" || author.trim() === "") {
    return "Field 'author' is required and must be a non-empty string.";
  }

  // Price validation: must be a non-negative number/integer
  const numPrice = Number(price);
  if (
    typeof price === "boolean" ||
    price === null ||
    price === undefined ||
    isNaN(numPrice) ||
    numPrice < 0
  ) {
    return "Field 'price' is required and must be a valid non-negative number.";
  }

  // Pages validation: must be a positive integer
  const numPages = Number(pages);
  if (
    typeof pages === "boolean" ||
    pages === null ||
    pages === undefined ||
    !Number.isInteger(numPages) ||
    numPages <= 0
  ) {
    return "Field 'pages' is required and must be a positive integer.";
  }

  return null;
}

// Root route: API overview
app.get("/", (request, response) => {
  response.status(200).json({
    message: "Welcome to Lab 3: REST API with Query Parameters, Validation & Debugging",
    student: {
      name: "M.POORNA CHANDU",
      registrationNumber: "252U1R9099",
      section: "CSE-GEN AI -2B"
    },
    supportedEndpoints: {
      getAllBooks: "GET /books/?search_q=&order_by=&order=&limit=&offset=&min_price=&max_price=",
      getOneBook: "GET /books/:bookId/",
      createBook: "POST /books/",
      updateBook: "PUT /books/:bookId/",
      deleteBook: "DELETE /books/:bookId/"
    }
  });
});

// ============================================================================
// 1. GET /books/ - Retrieve books with search, sorting, filtering & pagination
// ============================================================================
app.get("/books/", async (request, response) => {
  try {
    const {
      search_q = "",
      order_by = "id",
      order = "ASC",
      limit = "10",
      offset = "0",
      min_price,
      max_price
    } = request.query;

    // 1. Whitelist validation for sorting column (prevents SQL injection)
    const ALLOWED_ORDER_BY = ["id", "title", "author", "price", "pages"];
    const normalizedOrderBy = String(order_by).toLowerCase();
    const finalOrderBy = ALLOWED_ORDER_BY.includes(normalizedOrderBy) ? normalizedOrderBy : "id";

    // 2. Sort direction validation
    const normalizedOrder = String(order).toUpperCase();
    const finalOrder = normalizedOrder === "DESC" ? "DESC" : "ASC";

    // 3. Limit and Offset validation
    const parsedLimit = parseInt(limit, 10);
    const parsedOffset = parseInt(offset, 10);

    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      return sendError(response, 400, "Query parameter 'limit' must be a positive integer.");
    }
    if (isNaN(parsedOffset) || parsedOffset < 0) {
      return sendError(response, 400, "Query parameter 'offset' must be a non-negative integer.");
    }

    // 4. Price range validation (min_price & max_price)
    let minPriceNum = null;
    let maxPriceNum = null;

    if (min_price !== undefined) {
      minPriceNum = Number(min_price);
      if (isNaN(minPriceNum) || minPriceNum < 0) {
        return sendError(response, 400, "Query parameter 'min_price' must be a non-negative number.");
      }
    }

    if (max_price !== undefined) {
      maxPriceNum = Number(max_price);
      if (isNaN(maxPriceNum) || maxPriceNum < 0) {
        return sendError(response, 400, "Query parameter 'max_price' must be a non-negative number.");
      }
    }

    if (minPriceNum !== null && maxPriceNum !== null && minPriceNum > maxPriceNum) {
      return sendError(response, 400, "Query parameter 'min_price' cannot be greater than 'max_price'.");
    }

    // 5. Dynamic SQL query assembly with parameterization
    const whereConditions = [];
    const queryParams = [];

    // Partial title search (LIKE)
    if (String(search_q).trim() !== "") {
      whereConditions.push("title LIKE ?");
      queryParams.push(`%${String(search_q).trim()}%`);
    }

    // Price range filter (BETWEEN or single condition)
    if (minPriceNum !== null && maxPriceNum !== null) {
      whereConditions.push("price BETWEEN ? AND ?");
      queryParams.push(minPriceNum, maxPriceNum);
    } else if (minPriceNum !== null) {
      whereConditions.push("price >= ?");
      queryParams.push(minPriceNum);
    } else if (maxPriceNum !== null) {
      whereConditions.push("price <= ?");
      queryParams.push(maxPriceNum);
    }

    let sqlQuery = "SELECT id, title, author, price, pages FROM book";
    if (whereConditions.length > 0) {
      sqlQuery += " WHERE " + whereConditions.join(" AND ");
    }

    // Append order and pagination
    sqlQuery += ` ORDER BY ${finalOrderBy} ${finalOrder} LIMIT ? OFFSET ?`;
    queryParams.push(parsedLimit, parsedOffset);

    // Why await? Database reads require disk I/O. Awaiting pauses execution until SQLite resolves with rows.
    const books = await db.all(sqlQuery, queryParams);
    return response.status(200).json(books);
  } catch (error) {
    console.error("Error in GET /books/:", error.message);
    return sendError(response, 500, "Internal Server Error");
  }
});

// ============================================================================
// 2. GET /books/:bookId/ - Retrieve a single book by ID
// ============================================================================
app.get("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;

  if (!isValidPositiveInteger(bookId)) {
    return sendError(response, 400, "Invalid book ID. Must be a positive integer.");
  }

  const parsedId = parseInt(bookId, 10);

  try {
    const book = await db.get(
      "SELECT id, title, author, price, pages FROM book WHERE id = ?",
      [parsedId]
    );

    if (!book) {
      return sendError(response, 404, "Book not found");
    }

    return response.status(200).json(book);
  } catch (error) {
    console.error(`Error in GET /books/${bookId}:`, error.message);
    return sendError(response, 500, "Internal Server Error");
  }
});

// ============================================================================
// 3. POST /books/ - Create a new book with strict validation
// ============================================================================
app.post("/books/", async (request, response) => {
  const validationError = validateBookPayload(request.body);
  if (validationError) {
    return sendError(response, 400, validationError);
  }

  const { title, author, price, pages } = request.body;

  try {
    const result = await db.run(
      "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)",
      [title.trim(), author.trim(), Number(price), Number(pages)]
    );

    return response.status(201).json({
      message: "Book created successfully",
      bookId: result.lastID
    });
  } catch (error) {
    console.error("Error in POST /books/:", error.message);
    return sendError(response, 500, "Internal Server Error");
  }
});

// ============================================================================
// 4. PUT /books/:bookId/ - Update an existing book with validation
// ============================================================================
app.put("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;

  if (!isValidPositiveInteger(bookId)) {
    return sendError(response, 400, "Invalid book ID. Must be a positive integer.");
  }

  const validationError = validateBookPayload(request.body);
  if (validationError) {
    return sendError(response, 400, validationError);
  }

  const parsedId = parseInt(bookId, 10);
  const { title, author, price, pages } = request.body;

  try {
    const result = await db.run(
      "UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?",
      [title.trim(), author.trim(), Number(price), Number(pages), parsedId]
    );

    if (result.changes === 0) {
      return sendError(response, 404, "Book not found");
    }

    return response.status(200).json({ message: "Book updated successfully" });
  } catch (error) {
    console.error(`Error in PUT /books/${bookId}:`, error.message);
    return sendError(response, 500, "Internal Server Error");
  }
});

// ============================================================================
// 5. DELETE /books/:bookId/ - Remove a book
// ============================================================================
app.delete("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;

  if (!isValidPositiveInteger(bookId)) {
    return sendError(response, 400, "Invalid book ID. Must be a positive integer.");
  }

  const parsedId = parseInt(bookId, 10);

  try {
    const result = await db.run("DELETE FROM book WHERE id = ?", [parsedId]);

    if (result.changes === 0) {
      return sendError(response, 404, "Book not found");
    }

    return response.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error(`Error in DELETE /books/${bookId}:`, error.message);
    return sendError(response, 500, "Internal Server Error");
  }
});

// 404 handler for unknown routes
app.use((request, response) => {
  return sendError(response, 404, "Route not found");
});

// Initialize database connection and start HTTP server
async function initializeDBAndServer() {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Lab 3 server running at http://localhost:${PORT}/`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use (EADDRINUSE). Please stop the existing process or use another PORT.`);
      } else {
        console.error("Server error:", err.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
}

initializeDBAndServer();

