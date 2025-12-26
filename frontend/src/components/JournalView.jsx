// src/components/JournalView.jsx

export function JournalView({
  styles,
  theme,
  themeName,
  units,
  editingId,
  form,
  onRecordChange,
  addOrUpdateRecord,
  cancelEdit,
  fillFromLast,
  clearForm,
  goalsForm,
  setGoalsForm,
  saveGoals, 
  hasWeightGoal,
  currentWeight,
  deltaToWeightGoal,
  hasStepsGoal,
  healthSummary,
  targetSteps,
  exportCsv,
  importCsv,
  visibleRecords = [],
  loading,
  formatWeight,
  formatHeight,
  bmiPillStyle,
  bmiLabel,
  formatDate,
  startEdit,
  deleteRecord,
  query,
  setQuery,
  onlyLast7,
  setOnlyLast7,
  onlyWithBP,
  setOnlyWithBP,
  sortMode,
  setSortMode,
  pushToast,
}) {
  return (
    <>
      {/* --- tylko styl dla małych ekranów --- */}
      <style>{`
        @media (max-width: 900px) {
          .journal-layout {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
      `}</style>

      <div style={{ marginBottom: 8 }}>
        <h2 style={{ ...styles.h2, fontSize: 22, marginBottom: 4 }}>Dziennik</h2>
        <div style={styles.label}>
          Tu dodajesz i edytujesz swoje dane (waga, ciśnienie, kroki, sen, nastrój, notatki).
        </div>
      </div>

            <div
        className="journal-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.3fr)",
          gap: 16,
          alignItems: "start",
          marginTop: 8,
        }}
      >


        {/* LEWA KOLUMNA */}
        <div style={{ display: "grid", gap: 16 }}>
          <div style={styles.card}>
            <h2 style={styles.h2}>{editingId ? "Edytuj wpis" : "Dodaj wpis"}</h2>

            <form onSubmit={addOrUpdateRecord} style={{ display: "grid", gap: 10 }}>
              <input
                style={styles.input}
                name="weight"
                placeholder={units === "imperial" ? "Waga (lb) *" : "Waga (kg) *"}
                value={form.weight}
                onChange={onRecordChange}
              />
              <input
                style={styles.input}
                name="height"
                placeholder={
                  units === "imperial"
                    ? "Wzrost (cale, np. 70) *"
                    : "Wzrost (cm) *"
                }
                value={form.height}
                onChange={onRecordChange}
              />
              <input
                style={styles.input}
                name="bloodPressure"
                placeholder='Ciśnienie (np. "120/80")'
                value={form.bloodPressure}
                onChange={onRecordChange}
              />
              <input
                style={styles.input}
                name="steps"
                placeholder="Kroki (np. 8000)"
                value={form.steps}
                onChange={onRecordChange}
              />
              <input
                style={styles.input}
                name="sleepHours"
                placeholder="Sen (godziny, np. 7.5)"
                value={form.sleepHours}
                onChange={onRecordChange}
              />
              <select
                style={styles.input}
                name="mood"
                value={form.mood}
                onChange={onRecordChange}
              >
                <option value="">Nastrój (1–5)</option>
                <option value="1">☹️ 1 – bardzo zły</option>
                <option value="2">😕 2 – raczej zły</option>
                <option value="3">🙂 3 – neutralny / ok</option>
                <option value="4">😊 4 – dobry</option>
                <option value="5">😄 5 – bardzo dobry</option>
              </select>
              <input
                style={styles.input}
                name="note"
                placeholder="Notatka"
                value={form.note}
                onChange={onRecordChange}
              />

              <div style={styles.row}>
                <button type="submit" style={styles.btnPrimary}>
                  {editingId ? "Zapisz" : "Dodaj"}
                </button>
                {editingId && (
                  <button type="button" style={styles.btn} onClick={cancelEdit}>
                    Anuluj
                  </button>
                )}
                <button type="button" style={styles.btn} onClick={fillFromLast}>
                  Podstaw z ostatniego
                </button>
                <button type="button" style={styles.btn} onClick={clearForm}>
                  Wyczyść formularz
                </button>
              </div>

              <div style={styles.label}>
                Tip: statystyki na głównej liczą się z wpisów po filtrach (prawa strona).
              </div>
            </form>
          </div>

          <div style={styles.card}>
            <h2 style={styles.h2}>Cele</h2>
            <form onSubmit={saveGoals} style={{ display: "grid", gap: 10 }}>
              <input
                style={styles.input}
                name="weightGoal"
                placeholder="Docelowa waga (kg)"
                value={goalsForm.weightGoal}
                onChange={(e) =>
                  setGoalsForm((p) => ({
                    ...p,
                    weightGoal: e.target.value,
                  }))
                }
              />
              <input
                style={styles.input}
                name="stepsGoal"
                placeholder="Cel kroków (kroki / dzień)"
                value={goalsForm.stepsGoal}
                onChange={(e) =>
                  setGoalsForm((p) => ({
                    ...p,
                    stepsGoal: e.target.value,
                  }))
                }
              />
              <input
                style={styles.input}
                name="note"
                placeholder="Notatka do celów (opcjonalnie)"
                value={goalsForm.note}
                onChange={(e) =>
                  setGoalsForm((p) => ({
                    ...p,
                    note: e.target.value,
                  }))
                }
              />

              {hasWeightGoal && currentWeight != null && (
                <div style={{ ...styles.label, marginTop: 4 }}>
                  Aktualna waga: <b>{formatWeight(currentWeight, units)}</b>{" "}
                  {Number(deltaToWeightGoal) === 0 ? (
                    <span>– cel osiągnięty 🎉</span>
                  ) : (
                    <span>
                      – różnica do celu:{" "}
                      <b>
                        {formatWeight(Math.abs(deltaToWeightGoal), units)}{" "}
                        {deltaToWeightGoal > 0 ? "do zrzucenia" : "ponad celem"}
                      </b>
                    </span>
                  )}
                </div>
              )}

              {hasStepsGoal && healthSummary.avgSteps7 != null && (
                <div style={{ ...styles.label, marginTop: 4 }}>
                  Średnio (7 dni):{" "}
                  <b>{healthSummary.avgSteps7.toFixed(0)} kroków / dzień</b> (cel:{" "}
                  <b>{targetSteps}</b>)
                </div>
              )}

              <button type="submit" style={styles.btnPrimary}>
                Zapisz cele
              </button>
            </form>
          </div>

          <div style={styles.card}>
            <h2 style={styles.h2}>Eksport / Import</h2>

            <div style={styles.row}>
              <button type="button" style={styles.btn} onClick={exportCsv}>
                Export CSV
              </button>

              <label
                style={{
                  ...styles.btn,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                Import CSV
                <input
                  type="file"
                  accept=".csv,text/csv"
                  style={{ display: "none" }}
                  onChange={(e) => importCsv(e.target.files?.[0])}
                />
              </label>
            </div>

            <div style={styles.label}>
              Eksport pozwala zachować dane lub przenieść je do Excela.
            </div>
          </div>
        </div>

        {/* PRAWA KOLUMNA – LISTA WPISÓW W OKIENKU SCROLL */}
        <div
          style={{
            ...styles.card,
            maxHeight: 520,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <h2 style={styles.h2}>Wpisy ({visibleRecords.length})</h2>
          </div>

          <div style={{ display: "grid", gap: 10, marginBottom: 8 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <div style={styles.label}>Szukaj (id / notatka / ciśnienie / liczby)</div>
              <input
                style={styles.input}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="np. 120/80, 8000, 7.5..."
              />
            </div>

            <div style={styles.row}>
              <label
                style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 14 }}
              >
                <input
                  type="checkbox"
                  checked={onlyLast7}
                  onChange={(e) => setOnlyLast7(e.target.checked)}
                />
                <span style={styles.label}>Ostatnie 7 dni</span>
              </label>

              <label
                style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 14 }}
              >
                <input
                  type="checkbox"
                  checked={onlyWithBP}
                  onChange={(e) => setOnlyWithBP(e.target.checked)}
                />
                <span style={styles.label}>Tylko z ciśnieniem</span>
              </label>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={styles.label}>Sort:</span>
                <select
                  style={styles.input}
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value)}
                >
                  <option value="newest">Najnowsze</option>
                  <option value="oldest">Najstarsze</option>
                  <option value="bmiDesc">BMI malejąco</option>
                  <option value="bmiAsc">BMI rosnąco</option>
                </select>
              </div>

              <button
                style={styles.btn}
                type="button"
                onClick={() => {
                  setQuery("");
                  setOnlyLast7(false);
                  setOnlyWithBP(false);
                  setSortMode("newest");
                  pushToast("info", "Filtry", "Zresetowano filtry.");
                }}
              >
                Reset filtrów
              </button>
            </div>
          </div>

          {/* Scroll area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              paddingRight: 4,
            }}
          >
            {loading ? (
              <p>Ładowanie...</p>
            ) : visibleRecords.length === 0 ? (
              <p>Brak wpisów dla aktualnych filtrów.</p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {visibleRecords.map((r) => {
                  const bmi = calcBMI(r.weight, r.height);
                  return (
                    <div
                      key={r._id}
                      style={{
                        border: `1px solid ${theme.border}`,
                        borderRadius: 14,
                        padding: 12,
                        background:
                          themeName === "light"
                            ? "rgba(255,255,255,0.65)"
                            : "rgba(2,6,23,0.35)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <div style={styles.pill}>ID: {r._id}</div>
                      <div style={{ marginTop: 8 }}>
                        <b>Waga:</b> {formatWeight(r.weight, units)}
                      </div>
                      <div>
                        <b>Wzrost:</b> {formatHeight(r.height, units)}
                      </div>
                      <div>
                        <b>BMI:</b> {bmi == null ? "-" : bmi.toFixed(1)}{" "}
                        <span style={bmiPillStyle(styles, bmi)}>{bmiLabel(bmi)}</span>
                      </div>
                      <div>
                        <b>Ciśnienie:</b> {r.bloodPressure || "-"}
                      </div>
                      <div>
                        <b>Kroki:</b> {r.steps ?? "-"}
                      </div>
                      <div>
                        <b>Sen:</b>{" "}
                        {r.sleepHours != null ? `${r.sleepHours} h` : "-"}
                      </div>
                      <div>
                        <b>Nastrój:</b>{" "}
                        {r.mood != null ? (
                          <>
                            {r.mood >= 4
                              ? "😄"
                              : r.mood === 3
                              ? "🙂"
                              : r.mood === 2
                              ? "😕"
                              : "☹️"}{" "}
                            ({r.mood})
                          </>
                        ) : (
                          "-"
                        )}
                      </div>
                      <div>
                        <b>Notatka:</b> {r.note || "-"}
                      </div>
                      <div style={{ ...styles.label, marginTop: 4 }}>
                        Utworzono: {formatDate(r.createdAt)} | Aktualizacja:{" "}
                        {formatDate(r.updatedAt)}
                      </div>

                      <div style={styles.row}>
                        <button style={styles.btn} onClick={() => startEdit(r)}>
                          Edytuj
                        </button>
                        <button style={styles.btn} onClick={() => deleteRecord(r._id)}>
                          Usuń
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// lokalna funkcja, potrzebna w mapowaniu wpisów
function calcBMI(w, h) {
  const hm = Number(h) / 100;
  if (!w || !h || hm <= 0) return null;
  return Number(w) / (hm * hm);
}
