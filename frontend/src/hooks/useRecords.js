import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../services/api";
import { calcBMI } from "../utils/health";
import { lbToKg, inchesToCm } from "../utils/units";

export function useRecords({ token, units, pushToast, confirmToast }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    setForm((prev) => ({ ...prev, weight: "", height: "" }));
  }, [units]);

  const [query, setQuery] = useState("");
  const [onlyLast7, setOnlyLast7] = useState(false);
  const [onlyWithBP, setOnlyWithBP] = useState(false);
  const [sortMode, setSortMode] = useState("newest");

  // ✅ apiFetch zwraca już data (a nie Response) i rzuca błąd gdy !ok
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/records", {}, token);
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Błąd pobierania wpisów:", err);
      // ❌ celowo bez toastów (żeby nie dublować)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchRecords();
    else setRecords([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onRecordChange = (e) =>
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

  const startEdit = (r) => {
    setEditingId(r._id);
    setForm({
      weight: String(r.weight ?? ""),
      height: String(r.height ?? ""),
      bloodPressure: r.bloodPressure ?? "",
      steps: r.steps != null ? String(r.steps) : "",
      sleepHours: r.sleepHours != null ? String(r.sleepHours) : "",
      mood: r.mood != null ? String(r.mood) : "",
      note: r.note ?? "",
    });
    // ❌ bez toastów (żeby nie dublować)
  };

  const cancelEdit = () => {
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

  const fillFromLast = () => {
    if (!records.length) {
      // ❌ bez toastów (żeby nie dublować)
      return;
    }
    const last = [...records].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    setForm({
      weight: last.weight != null ? String(last.weight) : "",
      height: last.height != null ? String(last.height) : "",
      bloodPressure: last.bloodPressure ?? "",
      steps: last.steps != null ? String(last.steps) : "",
      sleepHours: last.sleepHours != null ? String(last.sleepHours) : "",
      mood: last.mood != null ? String(last.mood) : "",
      note: "",
    });
    setEditingId(null);
    // ❌ bez toastów (żeby nie dublować)
  };

  const clearForm = () => {
    cancelEdit();
    // ❌ bez toastów (żeby nie dublować)
  };

  const addOrUpdateRecord = async (e) => {
    e.preventDefault();

    if (!form.weight || !form.height) {
      // ❌ bez toastów (żeby nie dublować)
      return;
    }

    let weightKg = Number(form.weight);
    let heightCm = Number(form.height);

    if (units === "imperial") {
      weightKg = lbToKg(form.weight);
      heightCm = inchesToCm(form.height);
    }

    const body = {
      weight: weightKg,
      height: heightCm,
      bloodPressure: form.bloodPressure,
      steps: form.steps ? Number(form.steps) : undefined,
      sleepHours: form.sleepHours ? Number(form.sleepHours) : undefined,
      mood: form.mood ? Number(form.mood) : undefined,
      note: form.note,
    };

    try {
      const url = editingId ? `/records/${editingId}` : "/records";
      const method = editingId ? "PUT" : "POST";

      await apiFetch(url, { method, body: JSON.stringify(body) }, token);

      // ❌ bez toastów (żeby nie dublować)
      cancelEdit();
      await fetchRecords();
    } catch (err) {
      console.error("Błąd zapisu:", err);
      // ❌ bez toastów (żeby nie dublować)
    }
  };

  const deleteRecord = async (id) => {
    const ok = await confirmToast?.("Usuwanie", "Na pewno usunąć wpis?");
    if (!ok) return;

    try {
      await apiFetch(`/records/${id}`, { method: "DELETE" }, token);

      if (editingId === id) cancelEdit();
      // ❌ bez toastów (żeby nie dublować)
      await fetchRecords();
    } catch (err) {
      console.error("Błąd usuwania:", err);
      // ❌ bez toastów (żeby nie dublować)
    }
  };

  const visibleRecords = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = [...records];

    if (onlyLast7) {
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
      out = out.filter((r) => {
        const d = r.createdAt ? new Date(r.createdAt).getTime() : 0;
        return d >= cutoff;
      });
    }

    if (onlyWithBP) out = out.filter((r) => (r.bloodPressure || "").trim().length > 0);

    if (q) {
      out = out.filter((r) => {
        const hay = [
          r._id,
          String(r.weight ?? ""),
          String(r.height ?? ""),
          r.bloodPressure ?? "",
          r.steps ?? "",
          r.sleepHours ?? "",
          r.mood ?? "",
          r.note ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    if (sortMode === "newest") out.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortMode === "oldest") out.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortMode === "bmiDesc")
      out.sort((a, b) => (calcBMI(b.weight, b.height) ?? -999) - (calcBMI(a.weight, a.height) ?? -999));
    else if (sortMode === "bmiAsc")
      out.sort((a, b) => (calcBMI(a.weight, a.height) ?? 999) - (calcBMI(b.weight, b.height) ?? 999));

    return out;
  }, [records, query, onlyLast7, onlyWithBP, sortMode]);

  return {
    // state
    records,
    loading,
    editingId,
    form,
    query,
    onlyLast7,
    onlyWithBP,
    sortMode,

    // setters
    setRecords,
    setEditingId,
    setForm,
    setQuery,
    setOnlyLast7,
    setOnlyWithBP,
    setSortMode,

    // actions
    fetchRecords,
    onRecordChange,
    startEdit,
    cancelEdit,
    fillFromLast,
    clearForm,
    addOrUpdateRecord,
    deleteRecord,

    // derived
    visibleRecords,
  };
}
