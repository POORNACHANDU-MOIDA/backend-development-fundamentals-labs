const express = require("express");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// GET /
app.get("/", (request, response) => {
  response.status(200).json({ message: "Welcome to my Lab 1 server!" });
});

// GET /about
app.get("/about", (request, response) => {
  response.status(200).json({
    name: "M.POORNA CHANDU",
    registrationNumber: "252U1R9099"
  });
});

// GET /time
app.get("/time", (request, response) => {
  response.status(200).json({ currentDateTime: new Date().toISOString() });
});

// Handle every unknown route.
app.use((request, response) => {
  response.status(404).send("404 - Page Not Found");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Express server running on port ${PORT}`);
});
