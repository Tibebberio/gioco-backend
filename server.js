const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve HTML/CSS/JS

// Database file
const dbFile = "./players.json";
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, "{}");

// API GET: profilo giocatore
app.get("/profilo/:playerName", (req, res) => {
  const db = JSON.parse(fs.readFileSync(dbFile));
  const data = db[req.params.playerName] || null;
  res.json(data);
});

// API POST: aggiorna profilo
app.post("/profilo/:playerName", (req, res) => {
  const db = JSON.parse(fs.readFileSync(dbFile));
  db[req.params.playerName] = req.body;
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
  res.json({ status: "ok" });
});

// Avvio server
app.listen(port, () => {
  console.log(`✅ Server avviato su http://localhost:${port}`);
});
