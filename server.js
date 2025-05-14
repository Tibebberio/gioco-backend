const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { OAuth2Client } = require("google-auth-library");

const app = express();
const port = process.env.PORT || 3000;

const client = new OAuth2Client("210471226801-657qaagbqs8qvobavqb4m6qa4tib4ifk.apps.googleusercontent.com");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const dbFile = "./players";
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

// ✅ LOGIN CON GOOGLE
app.post("/login-google", async (req, res) => {
  const { idToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: "210471226801-657qaagbqs8qvobavqb4m6qa4tib4ifk.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;

    const db = JSON.parse(fs.readFileSync(dbFile));

    if (!db[googleId]) {
      db[googleId] = {
        email,
        name,
        profilo: {}
      };
      fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
    }

    res.json({ status: "ok", userId: googleId, email, name });

  } catch (error) {
    console.error("❌ Errore verifica token Google:", error);
    res.status(401).json({ error: "Token non valido" });
  }
});

// ✅ ROTTA PER VISUALIZZARE TUTTI GLI UTENTI
app.get("/utenti", (req, res) => {
  try {
    const db = JSON.parse(fs.readFileSync(dbFile));
    res.json(db);
  } catch (error) {
    res.status(500).json({ error: "Errore nella lettura degli utenti" });
  }
});

// Serve la pagina index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`✅ Server avviato su http://localhost:${port}`);
});
