import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("kinesiomed.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER,
    start_date TEXT,
    injury_date TEXT,
    history TEXT,
    diagnosis TEXT,
    evaluation TEXT,
    pain_level INTEGER DEFAULT 1,
    sports_activity TEXT,
    objective TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS evolutions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/patients", (req, res) => {
    const search = req.query.search || "";
    const patients = db.prepare(`
      SELECT p.*, 
      (SELECT COUNT(*) FROM evolutions WHERE patient_id = p.id) as sessions_count
      FROM patients p 
      WHERE p.name LIKE ? 
      ORDER BY p.created_at DESC
    `).all(`%${search}%`);
    res.json(patients);
  });

  app.get("/api/patients/:id", (req, res) => {
    const patient = db.prepare("SELECT * FROM patients WHERE id = ?").get(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    
    const evolutions = db.prepare("SELECT * FROM evolutions WHERE patient_id = ? ORDER BY date DESC").all(req.params.id);
    res.json({ ...patient, evolutions });
  });

  app.post("/api/patients", (req, res) => {
    const { 
      name, age, start_date, injury_date, history, 
      diagnosis, evaluation, pain_level, sports_activity, 
      objective, evolutions 
    } = req.body;

    const info = db.prepare(`
      INSERT INTO patients (
        name, age, start_date, injury_date, history, 
        diagnosis, evaluation, pain_level, sports_activity, objective
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name, age, start_date, injury_date, history, 
      diagnosis, evaluation, pain_level, sports_activity, objective
    );

    const patientId = info.lastInsertRowid;

    if (evolutions && Array.isArray(evolutions)) {
      const insertEvolution = db.prepare("INSERT INTO evolutions (patient_id, date, description) VALUES (?, ?, ?)");
      for (const ev of evolutions) {
        if (ev.date) {
          insertEvolution.run(patientId, ev.date, ev.description);
        }
      }
    }

    res.status(201).json({ id: patientId });
  });

  app.put("/api/patients/:id", (req, res) => {
    const { 
      name, age, start_date, injury_date, history, 
      diagnosis, evaluation, pain_level, sports_activity, 
      objective, evolutions 
    } = req.body;

    db.prepare(`
      UPDATE patients SET 
        name = ?, age = ?, start_date = ?, injury_date = ?, 
        history = ?, diagnosis = ?, evaluation = ?, 
        pain_level = ?, sports_activity = ?, objective = ?
      WHERE id = ?
    `).run(
      name, age, start_date, injury_date, history, 
      diagnosis, evaluation, pain_level, sports_activity, objective, 
      req.params.id
    );

    // Update evolutions: simple approach - delete and re-insert
    db.prepare("DELETE FROM evolutions WHERE patient_id = ?").run(req.params.id);
    if (evolutions && Array.isArray(evolutions)) {
      const insertEvolution = db.prepare("INSERT INTO evolutions (patient_id, date, description) VALUES (?, ?, ?)");
      for (const ev of evolutions) {
        if (ev.date) {
          insertEvolution.run(req.params.id, ev.date, ev.description);
        }
      }
    }

    res.json({ success: true });
  });

  app.delete("/api/patients/:id", (req, res) => {
    db.prepare("DELETE FROM patients WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
