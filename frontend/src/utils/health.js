// frontend/src/utils/health.js

export const calcBMI = (w, h) => {
  const hm = Number(h) / 100;
  if (!w || !h || hm <= 0) return null;
  return Number(w) / (hm * hm);
};

export const bmiLabel = (bmi) => {
  if (bmi == null || !Number.isFinite(Number(bmi))) return "-";
  const v = Number(bmi);
  if (v < 18.5) return "Niedowaga";
  if (v < 25) return "Norma";
  if (v < 30) return "Nadwaga";
  return "Otyłość";
};

export const bmiPillStyle = (styles, bmiValue) => {
  const label = bmiLabel(bmiValue);
  const isNorma = label === "Norma";
  return {
    ...styles.pill,
    background: isNorma ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.12)",
    borderColor: isNorma ? "rgba(22,163,74,0.4)" : "rgba(220,38,38,0.35)",
    color: isNorma ? "#166534" : "#b91c1c",
  };
};

export const avg = (arr) => {
  const nums = arr.map(Number).filter((x) => Number.isFinite(x));
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
};

export const minMax = (arr) => {
  const nums = arr.map(Number).filter((x) => Number.isFinite(x));
  if (nums.length === 0) return { min: null, max: null };
  return { min: Math.min(...nums), max: Math.max(...nums) };
};

export const formatDate = (iso) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("pl-PL");
  } catch {
    return iso;
  }
};
