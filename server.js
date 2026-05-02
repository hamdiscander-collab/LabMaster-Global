const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let db = {
  patients: {},
  labs: {}
};

/* =========================
   🤖 AI ENGINE (RULE BASED)
========================= */
function aiAnalyzeLab(results) {
  let alerts = [];
  let diagnosis = [];

  // Hemoglobin
  if (results.hb && results.hb < 10) {
    alerts.push("Severe Anemia");
    diagnosis.push("Iron deficiency anemia likely");
  }

  // WBC
  if (results.wbc && results.wbc > 12) {
    alerts.push("Infection");
    diagnosis.push("Possible bacterial infection");
  }

  // Glucose
  if (results.glucose && results.glucose > 180) {
    alerts.push("Hyperglycemia");
    diagnosis.push("Possible diabetes mellitus");
  }

  // Creatinine
  if (results.creatinine && results.creatinine > 1.5) {
    alerts.push("Kidney risk");
    diagnosis.push("Possible renal impairment");
  }

  return { alerts, diagnosis };
}

/* ===== ADD PATIENT ===== */
app.post("/patient", (req, res) => {
  const { user, patient } = req.body;

  if (!db.patients[user]) db.patients[user] = [];

  const newP = {
    id: Date.now(),
    ...patient,
    created: new Date().toISOString()
  };

  db.patients[user].push(newP);

  res.json(newP);
});

/* ===== GET PATIENTS ===== */
app.get("/patients/:user", (req, res) => {
  res.json(db.patients[req.params.user] || []);
});

/* ===== LAB + AI ANALYSIS ===== */
app.post("/lab", (req, res) => {
  const { user, patientId, results } = req.body;

  if (!db.labs[user]) db.labs[user] = [];

  const ai = aiAnalyzeLab(results);

  const record = {
    id: Date.now(),
    patientId,
    results,
    ai
  };

  db.labs[user].push(record);

  res.json(record);
});

/* ===== GET LABS ===== */
app.get("/labs/:user", (req, res) => {
  res.json(db.labs[req.params.user] || []);
});

/* ===== DASHBOARD AI ===== */
app.get("/ai/dashboard/:user", (req, res) => {
  const labs = db.labs[req.params.user] || [];

  let critical = 0;

  labs.forEach(l => {
    if (l.ai && l.ai.alerts.length > 0) critical++;
  });

  res.json({
    totalLabs: labs.length,
    criticalCases: critical,
    status: critical > 5 ? "High Risk Hospital Load" : "Stable"
  });
});

app.listen(3000, () => console.log("🧠 AI Hospital Running"));
