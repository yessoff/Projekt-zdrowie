import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

export function useGoals({ token, pushToast }) {
  const [goalsForm, setGoalsForm] = useState({
    weightGoal: "",
    stepsGoal: "",
    note: "",
  });

  const loadGoals = async () => {
    try {
      const res = await apiFetch("/goals", {}, token);
      if (!res.ok) return;
      const data = await res.json().catch(() => null);
      if (data) {
        setGoalsForm({
          weightGoal: data.targetWeight ? String(data.targetWeight) : "",
          stepsGoal: data.targetSteps ? String(data.targetSteps) : "",
          note: data.note ?? "",
        });
      }
    } catch {}
  };

  const saveGoals = async (e) => {
    e.preventDefault();

    if (!goalsForm.weightGoal && !goalsForm.stepsGoal) {
      pushToast("warn", "Brak danych", "Ustaw przynajmniej jeden cel (waga lub kroki).");
      return;
    }

    try {
      const body = {
        targetWeight: goalsForm.weightGoal ? Number(goalsForm.weightGoal) : undefined,
        targetSteps: goalsForm.stepsGoal ? Number(goalsForm.stepsGoal) : undefined,
        note: goalsForm.note,
      };

      const res = await apiFetch("/goals", { method: "PUT", body: JSON.stringify(body) }, token);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        pushToast("error", "Błąd celu", String(data.error || data.message || res.status));
        return;
      }

      setGoalsForm({
        weightGoal: data.targetWeight ? String(data.targetWeight) : "",
        stepsGoal: data.targetSteps ? String(data.targetSteps) : "",
        note: data.note ?? "",
      });

      pushToast("success", "Cele zapisane", "Cele zostały zapisane.");
    } catch (err) {
      console.error("Goal error:", err);
      pushToast("error", "Błąd celu", "Nie udało się zapisać celów.");
    }
  };

  useEffect(() => {
    if (token) loadGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return { goalsForm, setGoalsForm, loadGoals, saveGoals };
}
