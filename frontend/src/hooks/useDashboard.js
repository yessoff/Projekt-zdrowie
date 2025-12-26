// frontend/src/hooks/useDashboard.js
import { useMemo } from "react";
import { avg, minMax, formatDate, calcBMI, bmiLabel } from "../utils/health";
import { kgToLb, cmToInches } from "../utils/units";

export function useDashboard({ records = [], goalsForm = {}, units = "metric" }) {
  const visibleRecords = useMemo(() => {
    return Array.isArray(records) ? records : [];
  }, [records]);

  const chartDataWeight = useMemo(() => {
    return [...visibleRecords]
      .filter((r) => r.createdAt && r.weight != null)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((r) => {
        const wKg = Number(r.weight);
        const w = units === "imperial" ? kgToLb(wKg) : wKg;
        return { date: r.createdAt, weight: Number(w) };
      })
      .filter((d) => Number.isFinite(d.weight) && d.weight >= 0);
  }, [visibleRecords, units]);

  const chartDataSteps = useMemo(() => {
    return [...visibleRecords]
      .filter((r) => r.createdAt && r.steps != null)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((r) => ({ date: r.createdAt, weight: Number(r.steps) }))
      .filter((d) => Number.isFinite(d.weight) && d.weight >= 0);
  }, [visibleRecords]);

  const chartDataSleep = useMemo(() => {
    return [...visibleRecords]
      .filter((r) => r.createdAt && r.sleepHours != null)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((r) => ({ date: r.createdAt, weight: Number(r.sleepHours) }))
      .filter((d) => Number.isFinite(d.weight) && d.weight >= 0);
  }, [visibleRecords]);

  const stats = useMemo(() => {
    const ws = visibleRecords.map((r) => Number(r.weight)).filter((x) => Number.isFinite(x) && x >= 0);
    const hs = visibleRecords.map((r) => Number(r.height)).filter((x) => Number.isFinite(x) && x > 0);
    const bmis = visibleRecords.map((r) => calcBMI(r.weight, r.height)).filter((x) => Number.isFinite(x));

    const last =
      [...visibleRecords].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;

    // min/max wagi do UI (pod units)
    const wMMkg = minMax(ws);
    const wMM =
      units === "imperial"
        ? {
            min: wMMkg?.min != null ? kgToLb(wMMkg.min) : null,
            max: wMMkg?.max != null ? kgToLb(wMMkg.max) : null,
          }
        : wMMkg;

    // min/max wzrostu do UI (pod units)
    const hMMcm = minMax(hs);
    const hMM =
      units === "imperial"
        ? {
            min: hMMcm?.min != null ? cmToInches(hMMcm.min) : null,
            max: hMMcm?.max != null ? cmToInches(hMMcm.max) : null,
          }
        : hMMcm;

    return {
      count: visibleRecords.length,
      avgW: avg(ws),
      avgH: avg(hs),
      avgBMI: avg(bmis),
      wMM,
      hMM,
      bmiMM: minMax(bmis),
      last,
    };
  }, [visibleRecords, units]);

  const currentWeight = stats.last?.weight ?? null;

  const hasStepsGoal = !!goalsForm.stepsGoal && !Number.isNaN(Number(goalsForm.stepsGoal));
  const targetSteps = hasStepsGoal ? Number(goalsForm.stepsGoal) : 8000;

  const hasWeightGoal = !!goalsForm.weightGoal && !Number.isNaN(Number(goalsForm.weightGoal));
  const deltaToWeightGoal =
    hasWeightGoal && currentWeight != null ? currentWeight - Number(goalsForm.weightGoal) : null;

  const healthSummary = useMemo(() => {
    if (!records.length) {
      return {
        latest: null,
        avgSteps7: null,
        avgSleep7: null,
        moodAvg7: null,
        score: null,
        scoreLabel: "",
        scoreNote: "",
      };
    }

    const sorted = [...records].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const latest = sorted[0];

    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const last7 = sorted.filter((r) => r.createdAt && new Date(r.createdAt).getTime() >= cutoff);

    const stepsArr = last7.map((r) => Number(r.steps)).filter((v) => Number.isFinite(v) && v >= 0);
    const sleepArr = last7.map((r) => Number(r.sleepHours)).filter((v) => Number.isFinite(v) && v >= 0);
    const moodArr = last7.map((r) => Number(r.mood)).filter((v) => Number.isFinite(v) && v > 0);

    const avgSteps7 = stepsArr.length ? stepsArr.reduce((a, b) => a + b, 0) / stepsArr.length : null;
    const avgSleep7 = sleepArr.length ? sleepArr.reduce((a, b) => a + b, 0) / sleepArr.length : null;
    const moodAvg7 = moodArr.length ? moodArr.reduce((a, b) => a + b, 0) / moodArr.length : null;

    const latestBMI = calcBMI(latest.weight, latest.height);
    const bmiLbl = bmiLabel(latestBMI);
    const sleepGoal = 8;

    let score = 0;

    if (avgSteps7 != null && avgSteps7 > 0) {
      const ratio = Math.min(avgSteps7 / targetSteps, 1);
      score += 30 * ratio;
    }

    if (avgSleep7 != null && avgSleep7 > 0) {
      const diff = Math.abs(avgSleep7 - sleepGoal);
      const factor = Math.max(0, 1 - diff / 3);
      score += 30 * factor;
    }

    if (moodAvg7 != null && moodAvg7 > 0) {
      const factor = (moodAvg7 - 1) / 4;
      score += 25 * Math.max(0, Math.min(factor, 1));
    }

    if (bmiLbl === "Norma") score += 15;
    else if (bmiLbl === "Nadwaga") score += 8;
    else if (bmiLbl === "Niedowaga") score += 8;
    else if (bmiLbl === "Otyłość") score += 3;

    score = Math.round(Math.max(0, Math.min(score, 100)));

    let scoreLabel = "Do obserwacji";
    let scoreNote = "Warto utrzymywać regularne wpisy i zwracać uwagę na samopoczucie.";

    if (score >= 80) {
      scoreLabel = "Świetnie!";
      scoreNote = "Twoje nawyki wyglądają bardzo dobrze – trzymaj tak dalej.";
    } else if (score >= 60) {
      scoreLabel = "Całkiem nieźle";
      scoreNote = "Kilka drobnych poprawek (np. więcej snu lub kroków) da duży efekt.";
    } else {
      scoreLabel = "Do poprawy";
      scoreNote = "Spróbuj skupić się na śnie, ruchu i nastroju w najbliższych dniach.";
    }

    return { latest, avgSteps7, avgSleep7, moodAvg7, score, scoreLabel, scoreNote };
  }, [records, targetSteps]);

  // ✅ QUICK TIPS (żeby sekcja nie była pusta)
  const quickTips = useMemo(() => {
    if (!healthSummary.latest) return [];

    const tips = [];

    if (healthSummary.avgSleep7 != null && healthSummary.avgSleep7 < 7) {
      tips.push(`Śpisz średnio ${healthSummary.avgSleep7.toFixed(1)} h na dobę — spróbuj wydłużyć sen o 30 minut.`);
    }

    if (healthSummary.avgSteps7 != null) {
      if (healthSummary.avgSteps7 < targetSteps) {
        tips.push(`Średnio robisz ${healthSummary.avgSteps7.toFixed(0)} kroków/dzień — spróbuj dodać +1000 kroków.`);
      } else {
        tips.push(`Super! Cel kroków wygląda dobrze — utrzymaj regularność 👣`);
      }
    }

    if (healthSummary.moodAvg7 != null && healthSummary.moodAvg7 < 3) {
      tips.push(`Nastrój z ostatnich 7 dni jest niższy — rozważ krótki spacer + mniej ekranów wieczorem.`);
    }

    const bmi = calcBMI(healthSummary.latest.weight, healthSummary.latest.height);
    const lbl = bmiLabel(bmi);
    if (lbl && lbl !== "Norma") {
      tips.push(`BMI wskazuje: ${lbl}. Warto działać małymi krokami (ruch + regularne posiłki).`);
    }

    // jeśli nadal mało tipów — dodaj neutralne
    if (tips.length < 2) tips.push("Zrób dziś coś małego dla zdrowia: 10 minut spaceru albo rozciąganie.");
    return tips.slice(0, 3);
  }, [healthSummary, targetSteps]);

  return {
    visibleRecords,
    chartDataWeight,
    chartDataSteps,
    chartDataSleep,
    stats,
    currentWeight,
    hasWeightGoal,
    deltaToWeightGoal,
    hasStepsGoal,
    targetSteps,
    healthSummary,
    quickTips,
    formatDate,
  };
}
