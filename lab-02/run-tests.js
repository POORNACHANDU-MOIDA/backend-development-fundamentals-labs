// Test runner for Lab 2 CRUD API routes
// Executes all required curl-equivalent requests, captures full output, and generates test-results.md

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
        res.on("data", (chunk) => { body += chunk; });
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
  console.log("Starting server...");
  const server = spawn(process.execPath, [serverPath], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: ["ignore", "pipe", "pipe"]
  });

  server.stdout.on("data", (d) => console.log(`[server] ${d.toString().trim()}`));
  server.stderr.on("data", (d) => console.error(`[server err] ${d.toString().trim()}`));

  // Wait for server to start
  await sleep(1500);

  const tests = [
    {
      name: "GET all books",
      method: "GET",
      path: "/books/",
      data: null,
      curl: "curl -i http://localhost:3000/books/"
    },
    {
      name: "GET one book by valid ID",
      method: "GET",
      path: "/books/1/",
      data: null,
      curl: "curl -i http://localhost:3000/books/1/"
    },
    {
      name: "GET one book with non-existent ID (404)",
      method: "GET",
      path: "/books/999/",
      data: null,
      curl: "curl -i http://localhost:3000/books/999/"
    },
    {
      name: "GET one book with invalid non-integer ID (400)",
      method: "GET",
      path: "/books/abc/",
      data: null,
      curl: "curl -i http://localhost:3000/books/abc/"
    },
    {
      name: "GET one book with SQL-injection style ID (400)",
      method: "GET",
      path: "/books/1%20OR%201=1/",
      data: null,
      curl: 'curl -i "http://localhost:3000/books/1%20OR%201=1/"'
    },
    {
      name: "POST valid book (201 Created)",
      method: "POST",
      path: "/books/",
      data: {
        title: "Structure and Interpretation of Computer Programs",
        author: "Harold Abelson and Gerald Jay Sussman",
        price: 650,
        pages: 657
      },
      curl: 'curl -i -X POST http://localhost:3000/books/ -H "Content-Type: application/json" -d \'{"title":"Structure and Interpretation of Computer Programs","author":"Harold Abelson and Gerald Jay Sussman","price":650,"pages":657}\''
    },
    {
      name: "POST book with missing required fields (400 Bad Request)",
      method: "POST",
      path: "/books/",
      data: {
        title: "Incomplete Book Without Author or Price"
      },
      curl: 'curl -i -X POST http://localhost:3000/books/ -H "Content-Type: application/json" -d \'{"title":"Incomplete Book Without Author or Price"}\''
    },
    {
      name: "PUT update existing book (200 OK)",
      method: "PUT",
      path: "/books/1/",
      data: {
        title: "Clean Code: A Handbook of Agile Software Craftsmanship",
        author: "Robert C. Martin",
        price: 499,
        pages: 464
      },
      curl: 'curl -i -X PUT http://localhost:3000/books/1/ -H "Content-Type: application/json" -d \'{"title":"Clean Code: A Handbook of Agile Software Craftsmanship","author":"Robert C. Martin","price":499,"pages":464}\''
    },
    {
      name: "PUT update non-existent book ID (404 Not Found)",
      method: "PUT",
      path: "/books/999/",
      data: {
        title: "Ghost Book",
        author: "Ghost Writer",
        price: 250,
        pages: 150
      },
      curl: 'curl -i -X PUT http://localhost:3000/books/999/ -H "Content-Type: application/json" -d \'{"title":"Ghost Book","author":"Ghost Writer","price":250,"pages":150}\''
    },
    {
      name: "DELETE valid book ID (200 OK)",
      method: "DELETE",
      path: "/books/11/",
      data: null,
      curl: "curl -i -X DELETE http://localhost:3000/books/11/"
    },
    {
      name: "DELETE non-existent book ID (404 Not Found)",
      method: "DELETE",
      path: "/books/999/",
      data: null,
      curl: "curl -i -X DELETE http://localhost:3000/books/999/"
    }
  ];

  let markdown = `# Lab 2: CRUD API Route Test Results\n\n`;
  markdown += `**Student:** M.POORNA CHANDU | **Reg:** 252U1R9099 | **Section:** CSE-GEN AI -2B\n`;
  markdown += `**Date:** ${new Date().toISOString()}\n\n`;
  markdown += `## Test Summary\n\n`;
  markdown += `| # | Test Name | Method | Path | Expected | Actual Status | Result |\n`;
  markdown += `| :-: | :--- | :---: | :--- | :---: | :---: | :---: |\n`;

  const results = [];
  let dynamicCreatedId = null;

  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    if (t.name.includes("DELETE valid book ID") && dynamicCreatedId) {
      t.path = `/books/${dynamicCreatedId}/`;
      t.curl = `curl -i -X DELETE http://localhost:3000/books/${dynamicCreatedId}/`;
    }
    console.log(`Testing [${i + 1}/${tests.length}] ${t.name}...`);
    try {
      const res = await sendRequest(t.method, t.path, t.data);
      if (t.name.includes("POST valid book") && res.statusCode === 201) {
        try {
          const bodyObj = JSON.parse(res.body);
          if (bodyObj && bodyObj.bookId) {
            dynamicCreatedId = bodyObj.bookId;
          }
        } catch (e) {}
      }
      const passed =
        (t.name.includes("200") && res.statusCode === 200) ||
        (t.name.includes("201") && res.statusCode === 201) ||
        (t.name.includes("400") && res.statusCode === 400) ||
        (t.name.includes("404") && res.statusCode === 404) ||
        (t.name.includes("GET all") && res.statusCode === 200) ||
        (t.name.includes("GET one") && res.statusCode === 200);

      results.push({ ...t, res, passed });
      const expectedStatus = t.name.includes("201")
        ? 201
        : t.name.includes("400")
        ? 400
        : t.name.includes("404")
        ? 404
        : 200;

      markdown += `| ${i + 1} | ${t.name} | \`${t.method}\` | \`${t.path}\` | \`${expectedStatus}\` | \`${res.statusCode} ${res.statusMessage}\` | ${passed ? "PASS" : "FAIL"} |\n`;
    } catch (err) {
      console.error(`Error in test ${t.name}:`, err.message);
      results.push({ ...t, error: err.message, passed: false });
      markdown += `| ${i + 1} | ${t.name} | \`${t.method}\` | \`${t.path}\` | - | Error | FAIL |\n`;
    }
  }

  markdown += `\n## Detailed Request and Response Outputs\n\n`;

  results.forEach((r, idx) => {
    markdown += `### ${idx + 1}. ${r.name}\n\n`;
    markdown += `**Command:**\n\`\`\`bash\n${r.curl}\n\`\`\`\n\n`;
    markdown += `**Response:**\n\`\`\`http\nHTTP/1.1 ${r.res.statusCode} ${r.res.statusMessage}\n`;
    markdown += `Content-Type: ${r.res.headers["content-type"]}\n\n`;
    try {
      const parsed = JSON.parse(r.res.body);
      markdown += JSON.stringify(parsed, null, 2);
    } catch {
      markdown += r.res.body;
    }
    markdown += `\n\`\`\`\n\n`;
  });

  const outputPath = path.join(__dirname, "test-results.md");
  fs.writeFileSync(outputPath, markdown, "utf8");
  console.log(`Saved results to ${outputPath}`);

  server.kill();
  process.exit(0);
}

run().catch((e) => {
  console.error("Test runner failed:", e);
  process.exit(1);
});
