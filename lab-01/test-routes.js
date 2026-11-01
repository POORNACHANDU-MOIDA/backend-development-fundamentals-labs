const { spawn } = require("child_process");
const http = require("http");
const path = require("path");

const PORT = 3101;
const serverFile = process.argv[2] || "server.js";
const isHttpServer = serverFile === "server-http.js";
const serverPath = path.join(__dirname, serverFile);
const server = spawn(process.execPath, [serverPath], {
  env: { ...process.env, PORT: String(PORT) },
  stdio: ["ignore", "pipe", "pipe"]
});

function request(pathname) {
  return new Promise((resolve, reject) => {
    http.get({ hostname: "127.0.0.1", port: PORT, path: pathname }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => resolve({ statusCode: response.statusCode, body }));
    }).on("error", reject);
  });
}

function stop(exitCode) {
  server.kill();
  process.exit(exitCode);
}

server.stderr.on("data", (data) => {
  console.error(data.toString());
  stop(1);
});

server.stdout.on("data", async (data) => {
  if (!data.toString().includes("server running")) return;

  try {
    const home = await request("/");

    if (isHttpServer) {
      if (home.statusCode !== 200 || home.body !== "Hello") {
        throw new Error("The basic HTTP server did not return the expected Hello response.");
      }

      console.log("Basic HTTP server check passed: / returned Hello with 200.");
      stop(0);
      return;
    }

    const about = await request("/about");
    const time = await request("/time");
    const missing = await request("/does-not-exist");

    if (home.statusCode !== 200 || about.statusCode !== 200 || time.statusCode !== 200 || missing.statusCode !== 404) {
      throw new Error("One or more routes returned an unexpected HTTP status.");
    }

    if (missing.body !== "404 - Page Not Found") {
      throw new Error("The 404 route did not return the expected plain-text message.");
    }

    if (home.body !== "Welcome to my Lab 1 server!") {
      throw new Error("The home route did not return the expected welcome text.");
    }

    const aboutData = JSON.parse(about.body);
    if (aboutData.name !== "M.POORNA CHANDU" || aboutData.section !== "CSE-GEN AI -2B") {
      throw new Error("The about route did not return the expected name and section.");
    }

    console.log(`All ${serverFile} route checks passed: /, /about, /time, and 404.`);
    stop(0);
  } catch (error) {
    console.error(error.message);
    stop(1);
  }
});
