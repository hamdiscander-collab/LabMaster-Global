const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let db = {}; // قاعدة بيانات مؤقتة

/* ===== VERIFY PI ===== */
app.post("/verify", async (req, res) => {
  const { accessToken } = req.body;

  try {
    const response = await axios.get("https://api.minepi.com/v2/me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    res.json({ success: true, user: response.data });

  } catch (e) {
    res.status(400).json({ success: false });
  }
});

/* ===== ADD PATIENT ===== */
app.post("/patients", (req, res) => {
  const { username, name } = req.body;

  if (!db[username]) db[username] = [];
  db[username].push({ name });

  res.json({ success: true });
});

/* ===== GET PATIENTS ===== */
app.get("/patients/:username", (req, res) => {
  const { username } = req.params;
  res.json(db[username] || []);
});

app.listen(3000, () => console.log("Server running"));
