const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const { OAuth2Client } = require("google-auth-library");

const app = express();
const port = process.env.PORT || 3000;

// 🔐 MongoDB: Sostituisci con la tua URI Atlas
const MONGO_URI = "mongodb+srv://<UTENTE>:<PASSWORD>@cluster0.mongodb.net/gamedb?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("✅ Connesso a MongoDB");
}).catch(err => {
  console.error("❌ Errore connessione MongoDB:", err);
});

const client = new OAuth2Client("210471226801-657qaagbqs8qvobavqb4m6qa4tib4ifk.apps.googleusercontent.com");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve HTML/CSS/JS


// 📦 Modello giocatore
const playerSchema = new mongoose.Schema({
  googleId: String,
  playerName: String,
  email: String,
  name: String,
  profilo: Object, // Può contenere mappa, inventario, ecc.
});
const Player = mongoose.model("Player", playerSchema);


// ✅ API GET: profilo giocatore
app.get("/profilo/:playerName", async (req, res) => {
  try {
    const user = await Player.findOne({ playerName: req.params.playerName });
    if (user) {
      res.json(user.profilo);
    } else {
      res.status(404).json({ error: "Profilo non trovato" });
    }
  } catch (err) {
    res.status(500).json({ error: "Errore del server" });
  }
});

// ✅ API POST: aggiorna profilo
app.post("/profilo/:playerName", async (req, res) => {
  try {
    const updated = await Player.findOneAndUpdate(
      { playerName: req.params.playerName },
      { profilo: req.body },
      { new: true }
    );
    if (updated) {
      res.json({ status: "ok" });
    } else {
      res.status(404).json({ error: "Profilo non trovato" });
    }
  } catch (err) {
    res.status(500).json({ error: "Errore del server" });
  }
});

// ✅ API POST: login con Google
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

    // username semplificato da email
    const playerName = email.split("@")[0];

    let user = await Player.findOne({ googleId });

    if (!user) {
      user = await Player.create({
        googleId,
        email,
        name,
        playerName,
        profilo: {}
      });
    }

    res.json({ status: "ok", userId: googleId, email, name, playerName });

  } catch (error) {
    console.error("Errore login Google:", error);
    res.status(401).json({ error: "Token non valido" });
  }
});

// Avvio server
app.listen(port, () => {
  console.log(`✅ Server avviato su http://localhost:${port}`);
});
