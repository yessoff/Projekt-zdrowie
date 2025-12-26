// frontend/src/contexts/DataContext.jsx
import React, { createContext, useMemo, useState, useEffect, useContext } from "react";
import { useDashboard } from "../hooks/useDashboard";
import { apiFetch } from "../services/api";
import { useAuth } from "./AuthContext";
import { useToasts } from "./ToastContext";
import { toCsv, downloadTextFile, readCsvFile } from "../utils/csv";

export const DataContext = createContext(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData() must be used inside <DataProvider>");
  return ctx;
}

const API_BASE = "http://localhost:5001";

export function DataProvider({ children }) {
  const { auth } = useAuth();
  const toast = useToasts();

  const [loading, setLoading] = useState(false);

  const [records, setRecords] = useState([]);
  const [goalsForm, setGoalsForm] = useState({ weightGoal: "", stepsGoal: "", note: "" });

  // formularz wpisu (journal)
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    weight: "",
    height: "",
    bloodPressure: "",
    steps: "",
    sleepHours: "",
    mood: "",
    note: "",
  });

  // filtry listy (journal)
  const [query, setQuery] = useState("");
  const [onlyLast7, setOnlyLast7] = useState(false);
  const [onlyWithBP, setOnlyWithBP] = useState(false);
  const [sortMode, setSortMode] = useState("newest");

  // units z localStorage
  const [units, setUnits] = useState(() => {
    try {
      const stored = localStorage.getItem("pd_units");
      return stored === "imperial" ? "imperial" : "metric";
    } catch {
      return "metric";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("pd_units", units);
    } catch {
      // ignore
    }
  }, [units]);

  // ---- API: fetch records + goals ----
  const fetchAll = async () => {
    if (!auth?.token) return;

    setLoading(true);
    try {
      const [rRes, gRes] = await Promise.all([
        apiFetch(`${API_BASE}/records`, {}, auth.token),
        apiFetch(`${API_BASE}/goals`, {}, auth.token),
      ]);

      if (!rRes.ok) {
        const err = await rRes.json().catch(() => ({}));
        throw new Error(err.error || "Nie udało się pobrać wpisów");
      }

      const recs = await rRes.json();
      setRecords(Array.isArray(recs) ? recs : []);

      // cele mogą być null
      if (gRes.ok) {
        const g = await gRes.json();
        if (g) {
          setGoalsForm({
            weightGoal: g.targetWeight != null ? String(g.targetWeight) : "",
            stepsGoal: g.targetSteps != null ? String(g.targetSteps) : "",
            note: g.note ?? "",
          });
        }
      }
    } catch (e) {
      toast?.pushToast?.("error", "Błąd", e.message || "Błąd pobierania danych");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token]);

  // ---- handlers ----
  const onRecordChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const clearForm = () => {
    setEditingId(null);
    setForm({
      weight: "",
      height: "",
      bloodPressure: "",
      steps: "",
      sleepHours: "",
      mood: "",
      note: "",
    });
  };

  const startEdit = (r) => {
    setEditingId(r._id);
    setForm({
      weight: r.weight ?? "",
      height: r.height ?? "",
      bloodPressure: r.bloodPressure ?? "",
      steps: r.steps ?? "",
      sleepHours: r.sleepHours ?? "",
      mood: r.mood ?? "",
      note: r.note ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    clearForm();
  };

  const fillFromLast = () => {
    if (!records.length) return;
    const latest = [...records].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    if (!latest) return;

    setForm((p) => ({
      ...p,
      weight: latest.weight ?? p.weight,
      height: latest.height ?? p.height,
      bloodPressure: latest.bloodPressure ?? p.bloodPressure,
      steps: latest.steps ?? p.steps,
      sleepHours: latest.sleepHours ?? p.sleepHours,
      mood: latest.mood ?? p.mood,
      note: latest.note ?? p.note,
    }));
    toast?.pushToast?.("info", "Podstawiono", "Uzupełniono z ostatniego wpisu.");
  };

  const addOrUpdateRecord = async (e) => {
    e?.preventDefault?.();
    if (!auth?.token) return;

    try {
      const payload = {
        weight: form.weight,
        height: form.height,
        bloodPressure: form.bloodPressure,
        steps: form.steps,
        sleepHours: form.sleepHours,
        mood: form.mood,
        note: form.note,
      };

      const isEdit = !!editingId;
      const url = isEdit ? `${API_BASE}/records/${editingId}` : `${API_BASE}/records`;
      const method = isEdit ? "PUT" : "POST";

      const res = await apiFetch(
        url,
        {
          method,
          body: JSON.stringify(payload),
        },
        auth.token
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Nie udało się zapisać wpisu");
      }

      const saved = await res.json();

      setRecords((prev) => {
        if (!Array.isArray(prev)) return [saved];
        if (isEdit) return prev.map((x) => (x._id === saved._id ? saved : x));
        return [saved, ...prev];
      });

      toast?.pushToast?.("success", "Zapisano", isEdit ? "Zaktualizowano wpis." : "Dodano nowy wpis.");
      clearForm();
    } catch (e2) {
      toast?.pushToast?.("error", "Błąd", e2.message || "Nie udało się zapisać wpisu");
    }
  };

  const deleteRecord = async (id) => {
    if (!auth?.token) return;

    try {
      const res = await apiFetch(`${API_BASE}/records/${id}`, { method: "DELETE" }, auth.token);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Nie udało się usunąć wpisu");
      }

      setRecords((prev) => prev.filter((x) => x._id !== id));
      toast?.pushToast?.("success", "Usunięto", "Wpis został usunięty.");
    } catch (e) {
      toast?.pushToast?.("error", "Błąd", e.message || "Nie udało się usunąć wpisu");
    }
  };

  const saveGoals = async (e) => {
    e?.preventDefault?.();
    if (!auth?.token) return;

    try {
      // ✅ mapowanie na backendowe nazwy
      const payload = {
        targetWeight: goalsForm.weightGoal === "" ? undefined : Number(goalsForm.weightGoal),
        targetSteps: goalsForm.stepsGoal === "" ? undefined : Number(goalsForm.stepsGoal),
        note: goalsForm.note ?? "",
      };

      const res = await apiFetch(
        `${API_BASE}/goals`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        },
        auth.token
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Nie udało się zapisać celów");
      }

      const saved = await res.json();

      // ✅ zapisujemy z powrotem do formularza (czyści ewentualne NaN)
      setGoalsForm({
        weightGoal: saved.targetWeight != null ? String(saved.targetWeight) : "",
        stepsGoal: saved.targetSteps != null ? String(saved.targetSteps) : "",
        note: saved.note ?? "",
      });

      toast?.pushToast?.("success", "Zapisano", "Cele zostały zapisane.");
    } catch (e2) {
      toast?.pushToast?.("error", "Błąd", e2.message || "Nie udało się zapisać celów");
    }
  };

  // ✅ EXPORT CSV (działa)
  const exportCsv = () => {
    try {
      const rows = Array.isArray(records) ? records : [];
      const csv = toCsv(rows);

      const d = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const filename = `projekt-zdrowie_${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.csv`;

      downloadTextFile(filename, csv, "text/csv;charset=utf-8");
      toast?.pushToast?.("success", "Eksport CSV", "Pobrano plik CSV.");
    } catch (e) {
      toast?.pushToast?.("error", "Błąd", e?.message || "Nie udało się wyeksportować CSV.");
    }
  };

  // ✅ IMPORT CSV (czyta plik i dodaje wpisy do backendu)
  const importCsv = async (file) => {
    if (!auth?.token) return;
    if (!file) return;

    try {
      const rows = await readCsvFile(file); // tablica obiektów wg nagłówków
      if (!Array.isArray(rows) || rows.length === 0) {
        toast?.pushToast?.("warn", "Import CSV", "Plik jest pusty lub niepoprawny.");
        return;
      }

      // filtrujemy tylko sensowne rekordy (wymagane: weight + height)
      const clean = rows
        .map((r) => ({
          weight: r.weight,
          height: r.height,
          bloodPressure: r.bloodPressure ?? "",
          steps: r.steps ?? "",
          sleepHours: r.sleepHours ?? "",
          mood: r.mood ?? "",
          note: r.note ?? "",
        }))
        .filter((r) => String(r.weight ?? "").trim() !== "" && String(r.height ?? "").trim() !== "");

      if (!clean.length) {
        toast?.pushToast?.("warn", "Import CSV", "Brak poprawnych rekordów (wymagane weight i height).");
        return;
      }

      // dodajemy rekordy do backendu (POST /records)
      for (const r of clean) {
        const payload = {
          weight: r.weight,
          height: r.height,
          bloodPressure: r.bloodPressure,
          steps: r.steps,
          sleepHours: r.sleepHours,
          mood: r.mood,
          note: r.note,
        };

        const res = await apiFetch(
          `${API_BASE}/records`,
          { method: "POST", body: JSON.stringify(payload) },
          auth.token
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Import: błąd zapisu wpisu");
        }
      }

      toast?.pushToast?.("success", "Import CSV", `Zaimportowano wpisy: ${clean.length}.`);
      await fetchAll();
    } catch (e) {
      toast?.pushToast?.("error", "Błąd", e?.message || "Nie udało się zaimportować CSV.");
    }
  };

  // ---- visibleRecords (filtry) ----
  const visibleRecords = useMemo(() => {
    const base = Array.isArray(records) ? [...records] : [];

    // query
    const q = (query || "").trim().toLowerCase();
    let out = base;
    if (q) {
      out = out.filter((r) => {
        const hay = [
          r._id,
          r.bloodPressure,
          r.note,
          r.weight,
          r.height,
          r.steps,
          r.sleepHours,
          r.mood,
        ]
          .map((x) => (x == null ? "" : String(x).toLowerCase()))
          .join(" ");
        return hay.includes(q);
      });
    }

    // last 7 days
    if (onlyLast7) {
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
      out = out.filter((r) => r.createdAt && new Date(r.createdAt).getTime() >= cutoff);
    }

    // only with BP
    if (onlyWithBP) {
      out = out.filter((r) => (r.bloodPressure || "").trim().length > 0);
    }

    // sort
    if (sortMode === "oldest") {
      out.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortMode === "bmiAsc" || sortMode === "bmiDesc") {
      const bmi = (w, h) => {
        const hm = Number(h) / 100;
        if (!w || !h || hm <= 0) return null;
        return Number(w) / (hm * hm);
      };
      out.sort((a, b) => {
        const av = bmi(a.weight, a.height) ?? -Infinity;
        const bv = bmi(b.weight, b.height) ?? -Infinity;
        return sortMode === "bmiAsc" ? av - bv : bv - av;
      });
    } else {
      // newest
      out.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return out;
  }, [records, query, onlyLast7, onlyWithBP, sortMode]);

  // ✅ units przekazane do hooka (żeby wykresy zmieniały jednostki)
  const dashboard = useDashboard({ records: visibleRecords, goalsForm, units });

  const value = useMemo(
    () => ({
      // base
      loading,
      records,
      setRecords,

      // form/journal
      editingId,
      form,
      onRecordChange,
      addOrUpdateRecord,
      cancelEdit,
      fillFromLast,
      clearForm,
      startEdit,
      deleteRecord,

      // goals
      goalsForm,
      setGoalsForm,
      saveGoals,

      // filters
      visibleRecords,
      query,
      setQuery,
      onlyLast7,
      setOnlyLast7,
      onlyWithBP,
      setOnlyWithBP,
      sortMode,
      setSortMode,

      // units
      units,
      setUnits,

      // dashboard computed
      ...dashboard,

      // ✅ real export/import
      exportCsv,
      importCsv,
      pushToast: toast?.pushToast,
    }),
    [
      loading,
      records,
      editingId,
      form,
      goalsForm,
      visibleRecords,
      query,
      onlyLast7,
      onlyWithBP,
      sortMode,
      units,
      dashboard,
      toast,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
