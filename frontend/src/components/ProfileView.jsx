// frontend/src/components/ProfileView.jsx
import React from "react";

export function ProfileView({
  styles,
  auth,
  themeName,
  setThemeName,
  units,
  setUnits,
  printForDoctor,
  exportCsv,
  handleLogout,
}) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={styles.card}>
        <h2 style={{ ...styles.h2, fontSize: 22 }}>Profil</h2>
        {auth.user ? (
          <div style={{ fontSize: 14 }}>
            <div>
              <b>Imię:</b> {auth.user.name || "Bez imienia"}
            </div>
            <div>
              <b>Email:</b> {auth.user.email}
            </div>
          </div>
        ) : (
          <div style={styles.label}>Brak danych użytkownika.</div>
        )}
      </div>

      <div style={styles.card}>
        <h2 style={styles.h2}>Ustawienia</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {/* Motyw */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Motyw</div>
              <div style={styles.label}>
                Przełącz między trybem jasnym a ciemnym.
              </div>
            </div>
            <button
              style={styles.btn}
              type="button"
              onClick={() => setThemeName((m) => (m === "light" ? "dark" : "light"))}
            >
              {themeName === "light" ? "🌙 Ciemny" : "☀️ Jasny"}
            </button>
          </div>

          {/* Jednostki */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Jednostki</div>
              <div style={styles.label}>
                Wybierz sposób wyświetlania wagi i wzrostu (kg/cm lub lb/ft/in).
              </div>
            </div>
            <button
              style={styles.btn}
              type="button"
              onClick={() => setUnits((u) => (u === "metric" ? "imperial" : "metric"))}
            >
              {units === "metric" ? "🇪🇺 kg / cm" : "🇺🇸 lb / ft"}
            </button>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.h2}>Konto</h2>
        <button
          style={styles.btnPrimary}
          type="button"
          onClick={handleLogout}
        >
          Wyloguj
        </button>
      </div>
    </div>
  );
}
