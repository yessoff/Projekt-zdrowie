const express = require("express");
const mongoose = require("mongoose");
const HealthRecord = require("../models/HealthRecord");

const router = express.Router();

// ---- WALIDACJA LIMITÓW (anty-absurd) ----
const LIMITS = {
  weightKg: { min: 20, max: 300 },
  heightCm: { min: 80, max: 250 },
  steps: { min: 0, max: 100000 },
  sleepHours: { min: 0, max: 24 },
  mood: { min: 1, max: 5 },
};

function numOrNull(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function inRange(n, { min, max }) {
  return typeof n === "number" && n >= min && n <= max;
}

// GET wszystkie rekordy zalogowanego użytkownika
router.get("/", async (req, res) => {
  try {
    const records = await HealthRecord.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET jeden rekord po ID (tylko jeśli należy do użytkownika)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Niepoprawne ID" });
    }

    const record = await HealthRecord.findOne({ _id: id, user: req.userId });

    if (!record) {
      return res.status(404).json({ error: "Nie znaleziono rekordu" });
    }

    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST – dodaj rekord dla zalogowanego użytkownika
router.post("/", async (req, res) => {
  try {
    const {
      weight,
      height,
      bloodPressure,
      steps,
      sleepHours,
      mood,
      note,
    } = req.body || {};

    const w = numOrNull(weight);
    const h = numOrNull(height);
    const st = numOrNull(steps);
    const sl = numOrNull(sleepHours);
    const md = numOrNull(mood);
    
    if (w == null || h == null) {
      return res.status(400).json({ error: "Wymagane pola: weight i height (liczby)" });
    }
    
    if (!inRange(w, LIMITS.weightKg)) {
      return res.status(400).json({ error: `Nieprawidłowa waga (kg): min ${LIMITS.weightKg.min}, max ${LIMITS.weightKg.max}` });
    }
    if (!inRange(h, LIMITS.heightCm)) {
      return res.status(400).json({ error: `Nieprawidłowy wzrost (cm): min ${LIMITS.heightCm.min}, max ${LIMITS.heightCm.max}` });
    }
    
    if (st != null && !inRange(st, LIMITS.steps)) {
      return res.status(400).json({ error: `Nieprawidłowa liczba kroków: min ${LIMITS.steps.min}, max ${LIMITS.steps.max}` });
    }
    if (sl != null && !inRange(sl, LIMITS.sleepHours)) {
      return res.status(400).json({ error: `Nieprawidłowa liczba godzin snu: min ${LIMITS.sleepHours.min}, max ${LIMITS.sleepHours.max}` });
    }
    if (md != null && !inRange(md, LIMITS.mood)) {
      return res.status(400).json({ error: `Nieprawidłowy nastrój: min ${LIMITS.mood.min}, max ${LIMITS.mood.max}` });
    }
    
    const record = new HealthRecord({
      user: req.userId,
      weight: w,
      height: h,
      bloodPressure,
      steps: st == null ? undefined : st,
      sleepHours: sl == null ? undefined : sl,
      mood: md == null ? undefined : md,
      note,
    });

    await record.save();

    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT – edytuj rekord po ID (tylko swój)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Niepoprawne ID" });
    }

    // walidujemy tylko pola, które przyszły w body
    const w = req.body?.weight !== undefined ? numOrNull(req.body.weight) : undefined;
    const h = req.body?.height !== undefined ? numOrNull(req.body.height) : undefined;
    const st = req.body?.steps !== undefined ? numOrNull(req.body.steps) : undefined;
    const sl = req.body?.sleepHours !== undefined ? numOrNull(req.body.sleepHours) : undefined;
    const md = req.body?.mood !== undefined ? numOrNull(req.body.mood) : undefined;
    
    if (w !== undefined && (w == null || !inRange(w, LIMITS.weightKg))) {
      return res.status(400).json({ error: `Nieprawidłowa waga (kg): min ${LIMITS.weightKg.min}, max ${LIMITS.weightKg.max}` });
    }
    if (h !== undefined && (h == null || !inRange(h, LIMITS.heightCm))) {
      return res.status(400).json({ error: `Nieprawidłowy wzrost (cm): min ${LIMITS.heightCm.min}, max ${LIMITS.heightCm.max}` });
    }
    if (st !== undefined && st != null && !inRange(st, LIMITS.steps)) {
      return res.status(400).json({ error: `Nieprawidłowa liczba kroków: min ${LIMITS.steps.min}, max ${LIMITS.steps.max}` });
    }
    if (sl !== undefined && sl != null && !inRange(sl, LIMITS.sleepHours)) {
      return res.status(400).json({ error: `Nieprawidłowa liczba godzin snu: min ${LIMITS.sleepHours.min}, max ${LIMITS.sleepHours.max}` });
    }
    if (md !== undefined && md != null && !inRange(md, LIMITS.mood)) {
      return res.status(400).json({ error: `Nieprawidłowy nastrój: min ${LIMITS.mood.min}, max ${LIMITS.mood.max}` });
    }
    
    const update = { ...req.body };
    if (st !== undefined) update.steps = st == null ? undefined : st;
    if (sl !== undefined) update.sleepHours = sl == null ? undefined : sl;
    if (md !== undefined) update.mood = md == null ? undefined : md;
    
    const updated = await HealthRecord.findOneAndUpdate(
      { _id: id, user: req.userId },
      update,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Nie znaleziono rekordu" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE – usuń rekord po ID (tylko swój)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Niepoprawne ID" });
    }

    const deleted = await HealthRecord.findOneAndDelete({ _id: id, user: req.userId });

    if (!deleted) {
      return res.status(404).json({ error: "Nie znaleziono rekordu" });
    }

    res.json({ message: "Usunięto", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
