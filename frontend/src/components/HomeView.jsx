// frontend/src/components/HomeView.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export function HomeView({
  styles,
  themeName,
  healthSummary,
  hasWeightGoal,
  currentWeight,
  deltaToWeightGoal,
  goalsForm,
  hasStepsGoal,
  targetSteps,
  quickTips = [],
  chartDataWeight,
  chartDataSteps,
  chartDataSleep,
  formatWeight,
  formatHeight,
  bmiPillStyle,
  calcBMI,
  setActivePage,
  // nowe propsy:
  units,
  bmiLabel,
  formatDate,
  Chart,
}) {
  const navigate = useNavigate();

  return (
    <>
      {/* Quick tips responsive */}
      <style>{`
        @media (max-width: 520px) {
          .quick-tip-row {
            grid-template-columns: 1fr !important;
          }
          .quick-tip-row button {
            width: 100% !important;
          }
        }
      `}</style>

      {/* HEALTH SCORE */}
      <div style={{ ...styles.card, marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ ...styles.h2, fontSize: 22, marginBottom: 4 }}>
              Punkt zdrowia dzisiaj
            </h2>
            <div style={styles.label}>
              Prosty wynik 0–100 oparty na krokach, śnie, nastroju, BMI i celach.
            </div>
          </div>
          {healthSummary.score != null && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.45)",
                minWidth: 90,
                textAlign: "center",
                fontWeight: 800,
                fontSize: 22,
                background:
                  healthSummary.score >= 80
                    ? "rgba(22,163,74,0.12)"
                    : healthSummary.score >= 60
                    ? "rgba(234,179,8,0.12)"
                    : "rgba(220,38,38,0.12)",
              }}
            >
              {healthSummary.score}
              <span style={{ fontSize: 12 }}> /100</span>
            </div>
          )}
        </div>

        {healthSummary.latest ? (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
              {healthSummary.scoreLabel}
            </div>
            <div style={{ fontSize: 13 }}>{healthSummary.scoreNote}</div>
          </div>
        ) : (
          <div style={{ ...styles.label, marginTop: 8 }}>
            Brak danych – dodaj pierwszy wpis w Dzienniku, aby zobaczyć wynik.
          </div>
        )}
      </div>

      {/* OSTATNI WPIS + CELE */}
      <div className="resp-two-cols" style={{ marginBottom: 16 }}>
        {/* LEWY BLOK – Ostatni wpis */}
        <div
          style={{
            ...styles.card,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2
            style={{
              ...styles.h2,
              fontSize: 22,
              margin: "0 auto 12px",
            }}
          >
            Ostatni wpis
          </h2>

          {!healthSummary.latest ? (
            <div style={styles.label}>Brak danych (dodaj wpis w Dzienniku).</div>
          ) : (
            <>
              {/* rząd 1: Waga / Wzrost / BMI */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 12,
                  marginTop: 6,
                }}
              >
                {/* Waga */}
                <div
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid rgba(148,163,184,0.35)",
                    background:
                      themeName === "light"
                        ? "rgba(255,255,255,0.65)"
                        : "rgba(2,6,23,0.25)",
                  }}
                >
                  <div style={{ ...styles.label, fontSize: 12 }}>Waga</div>
                  <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
                    {formatWeight(healthSummary.latest.weight, units)}
                  </div>
                </div>

                {/* Wzrost */}
                <div
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid rgba(148,163,184,0.35)",
                    background:
                      themeName === "light"
                        ? "rgba(255,255,255,0.65)"
                        : "rgba(2,6,23,0.25)",
                  }}
                >
                  <div style={{ ...styles.label, fontSize: 12 }}>Wzrost</div>
                  <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
                    {formatHeight(healthSummary.latest.height, units)}
                  </div>
                </div>

                {/* BMI */}
                <div
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid rgba(148,163,184,0.35)",
                    background:
                      themeName === "light"
                        ? "rgba(255,255,255,0.65)"
                        : "rgba(2,6,23,0.25)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ ...styles.label, fontSize: 12 }}>BMI</div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      marginTop: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ fontSize: 22, fontWeight: 900 }}>
                      {(
                        calcBMI(
                          healthSummary.latest.weight,
                          healthSummary.latest.height
                        ) ?? 0
                      ).toFixed(1)}
                    </div>
                    <span
                      style={{
                        ...bmiPillStyle(
                          styles,
                          calcBMI(
                            healthSummary.latest.weight,
                            healthSummary.latest.height
                          )
                        ),
                        whiteSpace: "nowrap",
                      }}
                    >
                      {bmiLabel(
                        calcBMI(
                          healthSummary.latest.weight,
                          healthSummary.latest.height
                        )
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* rząd 2: Ciśnienie / Kroki / Sen */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 12,
                  marginTop: 12,
                }}
              >
                <div
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid rgba(148,163,184,0.35)",
                    background:
                      themeName === "light"
                        ? "rgba(255,255,255,0.65)"
                        : "rgba(2,6,23,0.25)",
                  }}
                >
                  <div style={{ ...styles.label, fontSize: 12 }}>Ciśnienie</div>
                  <div style={{ fontSize: 20, fontWeight: 900, marginTop: 6 }}>
                    {healthSummary.latest.bloodPressure || "-"}
                  </div>
                </div>

                <div
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid rgba(148,163,184,0.35)",
                    background:
                      themeName === "light"
                        ? "rgba(255,255,255,0.65)"
                        : "rgba(2,6,23,0.25)",
                  }}
                >
                  <div style={{ ...styles.label, fontSize: 12 }}>Kroki</div>
                  <div style={{ fontSize: 20, fontWeight: 900, marginTop: 6 }}>
                    {healthSummary.latest.steps ?? "-"}
                  </div>
                </div>

                <div
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid rgba(148,163,184,0.35)",
                    background:
                      themeName === "light"
                        ? "rgba(255,255,255,0.65)"
                        : "rgba(2,6,23,0.25)",
                  }}
                >
                  <div style={{ ...styles.label, fontSize: 12 }}>Sen</div>
                  <div style={{ fontSize: 20, fontWeight: 900, marginTop: 6 }}>
                    {healthSummary.latest.sleepHours != null
                      ? `${healthSummary.latest.sleepHours} h`
                      : "-"}
                  </div>
                </div>
              </div>

              {/* rząd 3: Nastrój + Notatka */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "0.42fr 0.58fr",
                  gap: 12,
                  marginTop: 12,
                }}
              >
                <div
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid rgba(148,163,184,0.35)",
                    background:
                      themeName === "light"
                        ? "rgba(255,255,255,0.65)"
                        : "rgba(2,6,23,0.25)",
                  }}
                >
                  <div style={{ ...styles.label, fontSize: 12 }}>Nastrój</div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 900,
                      marginTop: 6,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    {healthSummary.latest.mood != null ? (
                      <>
                        <span style={{ fontSize: 22 }}>
                          {healthSummary.latest.mood >= 4
                            ? "😄"
                            : healthSummary.latest.mood === 3
                            ? "🙂"
                            : healthSummary.latest.mood === 2
                            ? "😕"
                            : "☹️"}
                        </span>
                        <span>{healthSummary.latest.mood} / 5</span>
                      </>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>

                <div
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid rgba(148,163,184,0.35)",
                    background:
                      themeName === "light"
                        ? "rgba(255,255,255,0.65)"
                        : "rgba(2,6,23,0.25)",
                  }}
                >
                  <div style={{ ...styles.label, fontSize: 12 }}>Notatka</div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      marginTop: 6,
                      opacity: (healthSummary.latest.note || "").trim()
                        ? 1
                        : 0.75,
                      wordBreak: "break-word",
                    }}
                  >
                    {healthSummary.latest.note || "-"}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* PRAWY BLOK – CELE (PRZYWRÓCONY STYL jak na starym screenie) */}
        <div style={styles.card}>
          <h2 style={{ ...styles.h2, marginBottom: 10 }}>Cele</h2>

          {/* Cel wagi */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>
              Cel wagi
            </div>

            {hasWeightGoal ? (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 6,
                  }}
                >
                  <div style={{ fontSize: 22, lineHeight: 1 }}>🎯</div>
                  <div style={{ fontSize: 28, fontWeight: 900 }}>
                    {formatWeight(
                      goalsForm.weightGoal ? Number(goalsForm.weightGoal) : null,
                      units
                    )}
                  </div>
                </div>

                {currentWeight != null && (
                  <div style={{ fontSize: 13, marginTop: 2 }}>
                    Aktualna waga: <b>{formatWeight(currentWeight, units)}</b>
                  </div>
                )}

                {deltaToWeightGoal != null && Number(deltaToWeightGoal) !== 0 && (
                  <div style={{ fontSize: 13, marginTop: 2 }}>
                    Różnica:{" "}
                    <b>{formatWeight(Math.abs(deltaToWeightGoal), units)}</b>{" "}
                    {deltaToWeightGoal > 0 ? "do zrzucenia" : "ponad celem"}
                  </div>
                )}

                {Number(deltaToWeightGoal) === 0 && (
                  <div style={{ fontSize: 13, marginTop: 2 }}>
                    🎉 Cel wagi osiągnięty – gratulacje!
                  </div>
                )}
              </>
            ) : (
              <div style={styles.label}>Nie ustawiono jeszcze celu wagi.</div>
            )}
          </div>

          {/* Cel kroków */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>
              Cel kroków
            </div>

            {hasStepsGoal ? (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 6,
                  }}
                >
                  <div style={{ fontSize: 22, lineHeight: 1 }}>👣</div>
                  <div style={{ fontSize: 28, fontWeight: 900 }}>
                    {targetSteps} <span style={{ fontSize: 14, fontWeight: 800 }}>/ dzień</span>
                  </div>
                </div>

                {healthSummary.avgSteps7 != null && (
                  <div style={{ fontSize: 13, marginTop: 2 }}>
                    Średnio (7 dni):{" "}
                    <b>{healthSummary.avgSteps7.toFixed(0)} kroków / dzień</b>
                  </div>
                )}
              </>
            ) : (
              <div style={styles.label}>
                Ustaw dzienny cel kroków, aby lepiej śledzić aktywność.
              </div>
            )}
          </div>

          {goalsForm.note && (
            <div style={{ ...styles.label, marginTop: 6 }}>
              Notatka: <b>{goalsForm.note}</b>
            </div>
          )}

          <button
            type="button"
            style={{
              ...styles.btn,
              marginTop: 12,
              width: "100%",
            }}
            onClick={() => navigate("/journal")}
          >
            Zmień cele w Dzienniku
          </button>
        </div>
      </div>

      {/* MINI-KAFELKI KROKI / SEN / NASTRÓJ */}
      <div className="resp-three-cols" style={{ marginBottom: 16 }}>
        <div style={styles.card}>
          <div style={styles.label}>Kroki (ostatnie 7 dni)</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
            {healthSummary.avgSteps7 == null
              ? "-"
              : `${healthSummary.avgSteps7.toFixed(0)} / dzień`}
          </div>
          {hasStepsGoal && healthSummary.avgSteps7 != null && (
            <div style={{ ...styles.label, marginTop: 6 }}>
              Cel: <b>{targetSteps}</b> |{" "}
              {healthSummary.avgSteps7 >= targetSteps
                ? "cel osiągnięty 💪"
                : "jeszcze trochę kroków!"}
            </div>
          )}
        </div>

        <div style={styles.card}>
          <div style={styles.label}>Sen (ostatnie 7 dni)</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
            {healthSummary.avgSleep7 == null ? "-" : `${healthSummary.avgSleep7.toFixed(1)} h`}
          </div>
          <div style={{ ...styles.label, marginTop: 6 }}>
            Docelowo 7–9 h na dobę.
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.label}>Nastrój (ostatnie 7 dni)</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
            {healthSummary.moodAvg7 == null ? (
              "-"
            ) : (
              <>
                {healthSummary.moodAvg7 >= 4
                  ? "😄"
                  : healthSummary.moodAvg7 >= 3
                  ? "🙂"
                  : healthSummary.moodAvg7 >= 2
                  ? "😕"
                  : "☹️"}{" "}
                {healthSummary.moodAvg7.toFixed(1)} / 5
              </>
            )}
          </div>
          <div style={{ ...styles.label, marginTop: 6 }}>
            Zapisuj nastrój, żeby zauważyć, co Ci służy.
          </div>
        </div>
      </div>

      {/* Quick tips */}
      <div style={{ ...styles.card, marginBottom: 16 }}>
        <h2 style={styles.h2}>Dzisiejsze wskazówki</h2>
        <div style={{ display: "grid", gap: 8 }}>
          {(Array.isArray(quickTips) ? quickTips : []).map((t, idx) => (
            <div
              key={idx}
              className="quick-tip-row"
              style={{
                padding: 10,
                borderRadius: 12,
                background:
                  themeName === "light"
                    ? "rgba(255,255,255,0.8)"
                    : "rgba(2,6,23,0.45)",
                border: "1px solid rgba(148,163,184,0.45)",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 14 }}>{t}</span>
              <button
                type="button"
                style={{ ...styles.btn, whiteSpace: "normal", maxWidth: "100%" }}
                onClick={() => navigate("/info")}
              >
                Zobacz więcej w Info
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Charts: waga, kroki, sen */}
      <div style={{ ...styles.card, marginBottom: 16 }}>
        <h2 style={styles.h2}>Trend wagi</h2>
        {chartDataWeight.length < 2 ? (
          <div style={styles.meta}>Brak danych do wykresu (potrzeba minimum 2 wpisów).</div>
        ) : (
          <>
            <div style={styles.meta}>Wykres przedstawia zmianę wagi w czasie.</div>
            <div style={{ marginTop: 10 }}>
              <Chart data={chartDataWeight} />
            </div>
          </>
        )}
      </div>

      <div style={{ ...styles.card, marginBottom: 16 }}>
        <h2 style={styles.h2}>Trend kroków</h2>
        {chartDataSteps.length < 2 ? (
          <div style={styles.meta}>Brak danych do wykresu kroków.</div>
        ) : (
          <>
            <div style={styles.meta}>Zmiana liczby kroków w czasie.</div>
            <div style={{ marginTop: 10 }}>
              <Chart data={chartDataSteps} />
            </div>
          </>
        )}
      </div>

      <div style={{ ...styles.card, marginBottom: 16 }}>
        <h2 style={styles.h2}>Trend snu</h2>
        {chartDataSleep.length < 2 ? (
          <div style={styles.meta}>Brak danych do wykresu snu.</div>
        ) : (
          <>
            <div style={styles.meta}>Zmiana liczby godzin snu w czasie.</div>
            <div style={{ marginTop: 10 }}>
              <Chart data={chartDataSleep} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
