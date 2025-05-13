const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path"); // ✅ AGGIUNTO

const app = express();
const port = process.env.PORT || 3000; // ✅ CORRETTO per Render

app.use(cors());
app.use(express.json());

// ✅ NUOVO: Serve i file HTML, CSS e JS dalla cartella "public"
app.use(express.static(path.join(__dirname, "public")));

const dbFile = "./players.json";
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, "{}");

app.get("/profilo/:playerName", (req, res) => {
  const db = JSON.parse(fs.readFileSync(dbFile));
  const data = db[req.params.playerName] || null;
  res.json(data);
});

app.post("/profilo/:playerName", (req, res) => {
  const db = JSON.parse(fs.readFileSync(dbFile));
  db[req.params.playerName] = req.body;
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
  res.json({ status: "ok" });
});

// ✅ NUOVO: carica "index.html" alla radice del sito
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`✅ Server avviato su http://localhost:${port}`);
});
