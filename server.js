
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

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

app.listen(port, () => console.log(`Server avviato su http://localhost:${port}`));
