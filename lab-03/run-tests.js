// Lab 3: Automated test runner
// Comprehensive test suite covering REST routes, query parameters, validation, and error cases

const http = require("http");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const serverPath = path.join(__dirname, "server.js");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sendRequest(method, pathname, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    const headers = {};
    if (postData) {
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = Buffer.byteLength(postData);
    }

    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: PORT,
        path: pathname,
        method: method,
        headers: headers
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            headers: res.headers,
            body: body
          });
        });
      }
    );

    req.on("error", reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function run() {
  console.log("Starting Lab 3 server for automated testing...");
  const server = spawn(process.execPath, [serverPath], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: ["ignore", "pipe", "pipe"]
  });

  server.stdout.on("data", (d) => console.log(`[server] ${d.toString().trim()}`));
  server.stderr.on("data", (d) => console.error(`[server err] ${d.toString().trim()}`));

  // Wait for server to bind port 3000
  await sleep(1500);

  let createdBookId = null;

  const tests = [
    // --- QUERY PARAMETER TESTS ---
    {
      name: "GET all books (default limit 10, offset 0, order id ASC)",
      method: "GET",
      path: "/books/",
      expectedStatus: 200,
      validate: (body) => Array.isArray(body) && body.length === 10
    },
    {
      name: "GET search by title partial match (?search_q=Clean)",
      method: "GET",
      path: "/books/?search_q=Clean",
      expectedStatus: 200,
      validate: (body) => Array.isArray(body) && body.some((b) => b.title.includes("Clean"))
    },
    {
      name: "GET search by title (?search_q=JavaScript)",
      method: "GET",
      path: "/books/?search_q=JavaScript",
      expectedStatus: 200,
      validate: (body) => Array.isArray(body) && body.length >= 2
    },
    {
      name: "GET sort by price descending (?order_by=price&order=DESC)",
      method: "GET",
      path: "/books/?order_by=price&order=DESC",
      expectedStatus: 200,
      validate: (body) => Array.isArray(body) && body[0].price >= body[1].price
    },
    {
      name: "GET sort by pages ascending (?order_by=pages&order=ASC)",
      method: "GET",
      path: "/books/?order_by=pages&order=ASC",
      expectedStatus: 200,
      validate: (body) => Array.isArray(body) && body[0].pages <= body[1].pages
    },
    {
      name: "GET pagination limit=3, offset=0",
      method: "GET",
      path: "/books/?limit=3&offset=0",
      expectedStatus: 200,
      validate: (body) => Array.isArray(body) && body.length === 3
    },
    {
      name: "GET pagination limit=3, offset=3",
      method: "GET",
      path: "/books/?limit=3&offset=3",
      expectedStatus: 200,
      validate: (body) => Array.isArray(body) && body.length === 3
    },
    {
      name: "GET price range filter (?min_price=500&max_price=700)",
      method: "GET",
      path: "/books/?min_price=500&max_price=700",
      expectedStatus: 200,
      validate: (body) => Array.isArray(body) && body.every((b) => b.price >= 500 && b.price <= 700)
    },
    {
      name: "GET minimum price filter (?min_price=700)",
      method: "GET",
      path: "/books/?min_price=700",
      expectedStatus: 200,
      validate: (body) => Array.isArray(body) && body.every((b) => b.price >= 700)
    },
    {
      name: "GET maximum price filter (?max_price=350)",
      method: "GET",
      path: "/books/?max_price=350",
      expectedStatus: 200,
      validate: (body) => Array.isArray(body) && body.every((b) => b.price <= 350)
    },
    {
      name: "GET combined search, filter, sort & pagination",
      method: "GET",
      path: "/books/?search_q=Patterns&min_price=500&max_price=650&order_by=price&order=ASC&limit=5",
      expectedStatus: 200,
      validate: (body) => Array.isArray(body) && body.length > 0 && body.every((b) => b.price >= 500 && b.price <= 650)
    },
    {
      name: "GET invalid limit parameter (negative number -> 400)",
      method: "GET",
      path: "/books/?limit=-5",
      expectedStatus: 400,
      validate: (body) => body && body.message && body.message.includes("limit")
    },
    {
      name: "GET invalid min_price (non-numeric -> 400)",
      method: "GET",
      path: "/books/?min_price=abc",
      expectedStatus: 400,
      validate: (body) => body && body.message && body.message.includes("min_price")
    },
    {
      name: "GET invalid price range (min_price > max_price -> 400)",
      method: "GET",
      path: "/books/?min_price=800&max_price=400",
      expectedStatus: 400,
      validate: (body) => body && body.message && body.message.includes("cannot be greater")
    },

    // --- CRUD ROUTE TESTS ---
    {
      name: "GET single book by valid ID (/books/1/)",
      method: "GET",
      path: "/books/1/",
      expectedStatus: 200,
      validate: (body) => body && body.id === 1
    },
    {
      name: "GET book by nonexistent ID (/books/999/ -> 404)",
      method: "GET",
      path: "/books/999/",
      expectedStatus: 404,
      validate: (body) => body && body.message === "Book not found"
    },
    {
      name: "GET book with invalid non-integer ID (/books/abc/ -> 400)",
      method: "GET",
      path: "/books/abc/",
      expectedStatus: 400,
      validate: (body) => body && body.message && body.message.includes("positive integer")
    },
    {
      name: "GET book with SQL injection attempt (/books/1%20OR%201=1/ -> 400)",
      method: "GET",
      path: "/books/1%20OR%201=1/",
      expectedStatus: 400,
      validate: (body) => body && body.message && body.message.includes("positive integer")
    },

    // --- POST & VALIDATION TESTS ---
    {
      name: "POST create new book (valid payload -> 201)",
      method: "POST",
      path: "/books/",
      data: {
        title: "Site Reliability Engineering",
        author: "Betsy Beyer, Chris Jones, Jennifer Petoff, Niall Richard Murphy",
        price: 720,
        pages: 550
      },
      expectedStatus: 201,
      validate: (body) => {
        if (body && body.bookId) {
          createdBookId = body.bookId;
          return true;
        }
        return false;
      }
    },
    {
      name: "POST reject missing title (400 Bad Request)",
      method: "POST",
      path: "/books/",
      data: {
        author: "Anonymous Author",
        price: 400,
        pages: 200
      },
      expectedStatus: 400,
      validate: (body) => body && body.message && body.message.includes("title")
    },
    {
      name: "POST reject missing author (400 Bad Request)",
      method: "POST",
      path: "/books/",
      data: {
        title: "Book Without Author",
        price: 400,
        pages: 200
      },
      expectedStatus: 400,
      validate: (body) => body && body.message && body.message.includes("author")
    },
    {
      name: "POST reject non-numeric price (400 Bad Request)",
      method: "POST",
      path: "/books/",
      data: {
        title: "Invalid Price Book",
        author: "Author",
        price: "free",
        pages: 200
      },
      expectedStatus: 400,
      validate: (body) => body && body.message && body.message.includes("price")
    },

    // --- PUT & UPDATE TESTS ---
    {
      name: "PUT update existing book (/books/1/ -> 200)",
      method: "PUT",
      path: "/books/1/",
      data: {
        title: "Clean Code: A Handbook of Agile Software Craftsmanship (2nd Ed)",
        author: "Robert C. Martin",
        price: 499,
        pages: 464
      },
      expectedStatus: 200,
      validate: (body) => body && body.message === "Book updated successfully"
    },
    {
      name: "PUT update nonexistent book (/books/999/ -> 404)",
      method: "PUT",
      path: "/books/999/",
      data: {
        title: "Ghost Book",
        author: "Ghost Writer",
        price: 300,
        pages: 100
      },
      expectedStatus: 404,
      validate: (body) => body && body.message === "Book not found"
    },

    // --- DELETE TESTS ---
    {
      name: "DELETE newly created book (uses dynamic createdBookId -> 200)",
      method: "DELETE",
      path: () => `/books/${createdBookId}/`,
      expectedStatus: 200,
      validate: (body) => body && body.message === "Book deleted successfully"
    },
    {
      name: "DELETE nonexistent book (/books/999/ -> 404)",
      method: "DELETE",
      path: "/books/999/",
      expectedStatus: 404,
      validate: (body) => body && body.message === "Book not found"
    }
  ];

  let markdown = `# Lab 3: REST API Test Results\n\n`;
  markdown += `**Student:** M.POORNA CHANDU | **Reg:** 252U1R9099 | **Section:** CSE-GEN AI -2B\n`;
  markdown += `**Date:** ${new Date().toISOString()}\n\n`;
  markdown += `## Test Summary\n\n`;
  markdown += `| # | Test Scenario | Method | Endpoint / Query | Expected | Actual Status | Result |\n`;
  markdown += `| :-: | :--- | :---: | :--- | :---: | :---: | :---: |\n`;

  const results = [];

  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    const actualPath = typeof t.path === "function" ? t.path() : t.path;
    console.log(`Testing [${i + 1}/${tests.length}] ${t.name}...`);
    try {
      const res = await sendRequest(t.method, actualPath, t.data);
      let parsedBody = null;
      try {
        parsedBody = JSON.parse(res.body);
      } catch {
        parsedBody = res.body;
      }

      const statusMatch = res.statusCode === t.expectedStatus;
      const customValidation = t.validate ? t.validate(parsedBody) : true;
      const passed = statusMatch && customValidation;

      results.push({ ...t, actualPath, res, parsedBody, passed });

      markdown += `| ${i + 1} | ${t.name} | \`${t.method}\` | \`${actualPath}\` | \`${t.expectedStatus}\` | \`${res.statusCode} ${res.statusMessage}\` | ${passed ? "PASS" : "FAIL"} |\n`;
    } catch (err) {
      console.error(`Error in ${t.name}:`, err.message);
      results.push({ ...t, actualPath, error: err.message, passed: false });
      markdown += `| ${i + 1} | ${t.name} | \`${t.method}\` | \`${actualPath}\` | \`${t.expectedStatus}\` | Error | FAIL |\n`;
    }
  }

  markdown += `\n## Detailed Request & Response Logs\n\n`;

  results.forEach((r, idx) => {
    markdown += `### ${idx + 1}. ${r.name}\n\n`;
    markdown += `- **Method:** \`${r.method}\`\n`;
    markdown += `- **Path:** \`${r.actualPath}\`\n`;
    if (r.data) {
      markdown += `- **Request Body:**\n\`\`\`json\n${JSON.stringify(r.data, null, 2)}\n\`\`\`\n`;
    }
    markdown += `- **Status:** \`${r.res.statusCode} ${r.res.statusMessage}\`\n`;
    markdown += `- **Response Body:**\n\`\`\`json\n${JSON.stringify(r.parsedBody, null, 2)}\n\`\`\`\n\n`;
  });

  const outputPath = path.join(__dirname, "test-results.md");
  fs.writeFileSync(outputPath, markdown, "utf8");
  console.log(`Saved full test results to ${outputPath}`);

  server.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});

