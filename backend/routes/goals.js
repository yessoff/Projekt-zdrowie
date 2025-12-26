const express = require("express");
const router = express.Router();
const Goal = require("../models/Goal");

// ---- WALIDACJA LIMITÓW (cele) ----
const GOAL_LIMITS = {
  targetWeight: { min: 20, max: 300 },
  targetSteps: { min: 1000, max: 100000 },
};

function numOrNull(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function inRange(n, { min, max }) {
  return typeof n === "number" && n >= min && n <= max;
}


function getUserId(req) {
  return req.userId || req.user?._id || req.user?.id;
}

// GET /goals – pobierz cele zalogowanego użytkownika
router.get("/", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized (brak userId w req)" });
    }

    const goal = await Goal.findOne({ user: userId });
    return res.json(goal || null);
  } catch (err) {
    console.error("GET /goals error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// PUT /goals – utwórz / zaktualizuj cele użytkownika
router.put("/", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized (brak userId w req)" });
    }

    const { targetWeight, targetSteps, note } = req.body;
    
    const tw = numOrNull(targetWeight);
    const ts = numOrNull(targetSteps);
    
    if (tw == null && ts == null) {
      return res.status(400).json({ error: "Wymagany co najmniej jeden cel (waga lub kroki)." });
    }
    
    if (tw != null && !inRange(tw, GOAL_LIMITS.targetWeight)) {
      return res.status(400).json({
        error: `Nieprawidłowy cel wagi (kg): min ${GOAL_LIMITS.targetWeight.min}, max ${GOAL_LIMITS.targetWeight.max}`,
      });
    }
    
    if (ts != null && !inRange(ts, GOAL_LIMITS.targetSteps)) {
      return res.status(400).json({
        error: `Nieprawidłowy cel kroków: min ${GOAL_LIMITS.targetSteps.min}, max ${GOAL_LIMITS.targetSteps.max}`,
      });
    }

    const update = {
      user: userId,
      note: note ?? "",
    };

    if (tw != null) update.targetWeight = tw;
    if (ts != null) update.targetSteps = ts;

    const goal = await Goal.findOneAndUpdate(
      { user: userId },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json(goal);
  } catch (err) {
    console.error("PUT /goals error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
