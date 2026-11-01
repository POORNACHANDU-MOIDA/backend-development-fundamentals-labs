const http = require("http");

const PORT = Number(process.env.PORT) || 3000;

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(data));
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  if (request.method !== "GET") {
    return sendJson(response, 404, { error: "404 - Page Not Found" });
  }

  if (url.pathname === "/") {
    return sendJson(response, 200, { message: "Welcome to my Lab 1 server!" });
  }

  if (url.pathname === "/about") {
    return sendJson(response, 200, {
      name: "M.POORNA CHANDU",
      registrationNumber: "252U1R9099"
    });
  }

  if (url.pathname === "/time") {
    return sendJson(response, 200, { currentDateTime: new Date().toISOString() });
  }

  return sendJson(response, 404, { error: "404 - Page Not Found" });
});

server.listen(PORT, () => {
  console.log(`HTTP server running at http://localhost:${PORT}`);
});
