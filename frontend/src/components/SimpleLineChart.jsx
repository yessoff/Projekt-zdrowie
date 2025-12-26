// frontend/src/components/SimpleLineChart.jsx
import React, { useMemo } from "react";

function defaultFormatTick(v, range) {
  if (!Number.isFinite(v)) return "";
  if (range >= 1000) return String(Math.round(v));
  if (range >= 50) return String(Math.round(v));
  return v.toFixed(1);
}

const KG_TO_LB = 2.2046226218;

function getUnitsFromStorage() {
  try {
    const u = localStorage.getItem("pd_units");
    return u === "imperial" ? "imperial" : "metric";
  } catch {
    return "metric";
  }
}

/**
 * Heurystyka: wykres ma 3 typy danych u Ciebie (waga / kroki / sen).
 * - kroki: zwykle > 1000
 * - sen: zwykle < 20
 * - waga: zwykle > ~25 i < ~350
 * Dzięki temu NIE psujemy kroków i snu przy imperial.
 */
function looksLikeWeightRange(min, max) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return false;
  if (max <= 20) return false; // raczej sen
  if (max >= 1000) return false; // raczej kroki
  // typowe widełki wagi (kg)
  return max >= 25 && max <= 350;
}

export function SimpleLineChart({ data, height = 240, formatValue, valueKey = "weight" }) {
  const prepared = useMemo(() => {
    const rows = Array.isArray(data) ? data : [];
    const rawValues = rows
      .map((d) => Number(d?.[valueKey]))
      .filter((v) => Number.isFinite(v));

    if (rawValues.length < 2) return { ok: false };

    const rawMin0 = Math.min(...rawValues);
    const rawMax0 = Math.max(...rawValues);
    const rawRange0 = rawMax0 - rawMin0;

    // auto-konwersja tylko dla wagi i tylko gdy units=imperial
    const units = getUnitsFromStorage();
    const shouldConvertWeight = units === "imperial" && looksLikeWeightRange(rawMin0, rawMax0);
    const transform = shouldConvertWeight ? (v) => v * KG_TO_LB : (v) => v;

    const values = rawValues.map(transform);

    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const rawRange = rawMax - rawMin;

    const pad = Math.max((rawRange || 1) * 0.08, 0.5);

    // skala nie schodzi poniżej 0 (żeby nie było minusów)
    const scaleMin = Math.max(0, rawMin - pad);
    const scaleMax = rawMax + pad;
    const scaleRange = scaleMax - scaleMin || 1;

    // ticki liczone z REALNYCH danych (bez paddingu)
    const ticks =
      rawRange === 0
        ? [rawMin, rawMin, rawMin, rawMin, rawMin]
        : [0, 0.25, 0.5, 0.75, 1].map((t) => rawMin + rawRange * t);

    return {
      ok: true,
      values,
      rawMin,
      rawMax,
      rawRange: rawRange || 1,
      scaleMin,
      scaleMax,
      scaleRange,
      ticks,
    };
  }, [data, valueKey]);

  const VB_W = 1000;
  const VB_H = 260;

  const M_LEFT = 86;
  const M_RIGHT = 18;
  const M_TOP = 18;
  const M_BOTTOM = 32;

  const plotW = VB_W - M_LEFT - M_RIGHT;
  const plotH = VB_H - M_TOP - M_BOTTOM;

  const toX = (i, n) => (n <= 1 ? M_LEFT : M_LEFT + (i * plotW) / (n - 1));

  const toY = (v) => {
    const t = (v - prepared.scaleMin) / (prepared.scaleRange || 1);
    return M_TOP + (1 - t) * plotH;
  };

  if (!prepared.ok) {
    return (
      <div
        style={{
          width: "100%",
          height,
          borderRadius: 16,
          background: "rgba(15,23,42,0.06)",
          border: "1px solid rgba(148,163,184,0.35)",
        }}
      />
    );
  }

  const values = prepared.values;
  const points = values.map((v, i) => `${toX(i, values.length)},${toY(v)}`).join(" ");

  const lineColor = "#2563eb";
  const gridColor = "rgba(148,163,184,0.35)";
  const textColor = "rgba(15,23,42,0.85)";

  const fmt = (v) =>
    typeof formatValue === "function"
      ? formatValue(v, prepared.rawRange)
      : defaultFormatTick(v, prepared.rawRange);

  return (
    <div style={{ width: "100%", height }}>
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <rect x="0" y="0" width={VB_W} height={VB_H} rx="18" ry="18" fill="rgba(15,23,42,0.06)" />

        {/* 5 poziomych linii (ciągłe, cienkie) + ticki */}
        {prepared.ticks.map((val, idx) => {
          const y = toY(val);
          return (
            <g key={idx}>
              <line
                x1={M_LEFT}
                y1={y}
                x2={VB_W - M_RIGHT}
                y2={y}
                stroke={gridColor}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={M_LEFT - 12}
                y={y + 5}
                textAnchor="end"
                fontSize="14"
                fontWeight="600"
                fill={textColor}
              >
                {fmt(val)}
              </text>
            </g>
          );
        })}

        {/* główna linia (cienka) */}
        <polyline
          fill="none"
          stroke={lineColor}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          points={points}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* kropki (okrągłe, nie “spłaszczone”) */}
        {values.map((v, i) => (
          <circle
            key={i}
            cx={toX(i, values.length)}
            cy={toY(v)}
            r="3"
            fill={lineColor}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  );
}

// ✅ dla bezpieczeństwa: default export też istnieje
export default SimpleLineChart;
