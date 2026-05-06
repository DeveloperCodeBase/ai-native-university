const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("AI Native University is running on Ubuntu VPS.");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});