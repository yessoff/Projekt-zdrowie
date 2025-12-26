// frontend/src/utils/units.js

export const KG_PER_LB = 0.45359237;
export const CM_PER_INCH = 2.54;

export const kgToLb = (kg) => {
  const v = Number(kg);
  if (!Number.isFinite(v)) return null;
  return v / KG_PER_LB;
};

export const lbToKg = (lb) => {
  const v = Number(lb);
  if (!Number.isFinite(v)) return null;
  return v * KG_PER_LB;
};

export const cmToInches = (cm) => {
  const v = Number(cm);
  if (!Number.isFinite(v)) return null;
  return v / CM_PER_INCH;
};

export const inchesToCm = (inch) => {
  const v = Number(inch);
  if (!Number.isFinite(v)) return null;
  return v * CM_PER_INCH;
};

export const formatWeight = (kg, units) => {
  if (kg == null || !Number.isFinite(Number(kg))) return "-";
  const v = Number(kg);
  if (units === "imperial") {
    const lb = kgToLb(v);
    return lb == null ? "-" : `${lb.toFixed(1)} lb`;
  }
  return `${v} kg`;
};

export const formatHeight = (cm, units) => {
  if (cm == null || !Number.isFinite(Number(cm))) return "-";
  const v = Number(cm);
  if (units === "imperial") {
    const totalInches = cmToInches(v);
    if (totalInches == null) return "-";
    const ft = Math.floor(totalInches / 12);
    const inch = Math.round(totalInches - ft * 12);
    return `${ft} ft ${inch} in`;
  }
  return `${v} cm`;
};
