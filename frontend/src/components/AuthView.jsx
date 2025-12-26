// src/components/AuthView.jsx

export function AuthView({
  theme,
  themeName,
  styles,
  authMode,
  setAuthMode,
  authForm,
  onAuthChange,
  handleLoginOrRegister,
}) {
  return (
    <>
      {/* Responsive only for this view */}
      <style>{`
        @media (max-width: 980px) {
          .auth-wrap {
            grid-template-columns: 1fr !important;
            max-width: 620px !important;
            padding: 16px !important;
          }
          .auth-hero {
            max-width: 100% !important;
            padding: 8px !important;
          }
          .auth-title {
            font-size: 42px !important;
            line-height: 1.05 !important;
          }
          .auth-card {
            max-width: 100% !important;
          }
        }

        @media (max-width: 420px) {
          .auth-wrap { padding: 12px !important; }
          .auth-title { font-size: 34px !important; }
        }
      `}</style>

      <div
        className="auth-wrap"
        style={{
          height: "100%",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          alignItems: "center",
          justifyItems: "center",
          padding: 24,
          boxSizing: "border-box",
          gap: 18,
          maxWidth: 1200,
          margin: "0 auto",
          overflowX: "hidden",
        }}
      >
        {/* LEFT HERO */}
        <div
          className="auth-hero"
          style={{
            width: "100%",
            maxWidth: 620,
            padding: 18,
            boxSizing: "border-box",
            overflowX: "hidden",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div
                className="auth-title"
                style={{
                  fontSize: 58,
                  fontWeight: 900,
                  letterSpacing: -1,
                  lineHeight: 1.0,
                  wordBreak: "break-word",
                }}
              >
                Świadomie. Zdrowo. Lepiej.
              </div>
              <div style={{ marginTop: 12, fontSize: 16, opacity: 0.9 }}>
                Prosty dziennik wagi, ciśnienia, kroków, snu i nastroju — w jednym miejscu.
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 20 }}>✅</span>
              <span style={{ fontSize: 15, opacity: 0.95 }}>
                Wpisy wagi, wzrostu i ciśnienia + automatyczne BMI
              </span>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 20 }}>👣</span>
              <span style={{ fontSize: 15, opacity: 0.95 }}>Kroki, sen i nastrój w jednym dzienniku</span>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 20 }}>🎯</span>
              <span style={{ fontSize: 15, opacity: 0.95 }}>Cele wagi i kroków + szybkie wskazówki</span>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 20 }}>🧾</span>
              <span style={{ fontSize: 15, opacity: 0.95 }}>Eksport CSV i podgląd raportu do wydruku</span>
            </div>
          </div>
        </div>

        {/* RIGHT CARD */}
        <div
          className="auth-card"
          style={{
            width: "100%",
            maxWidth: 520,
            borderRadius: 28,
            border: `1px solid ${theme.border}`,
            background: themeName === "light" ? "rgba(255,255,255,0.78)" : "rgba(2,6,23,0.55)",
            backdropFilter: "blur(18px)",
            boxShadow: "0 28px 80px rgba(15,23,42,0.35)",
            padding: 22,
            boxSizing: "border-box",
            overflowX: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              marginBottom: 14,
              borderRadius: 999,
              background: themeName === "light" ? "rgba(15,23,42,0.06)" : "rgba(248,250,252,0.06)",
              padding: 4,
            }}
          >
            <button
              type="button"
              style={{
                border: "none",
                borderRadius: 999,
                cursor: "pointer",
                padding: "10px 0",
                fontWeight: 800,
                background: authMode === "login" ? "#0f172a" : "transparent",
                color: authMode === "login" ? "#fff" : theme.text,
                boxShadow: authMode === "login" ? "0 12px 26px rgba(15,23,42,0.35)" : "none",
                transition: "all 0.2s ease",
              }}
              onClick={() => setAuthMode("login")}
            >
              Logowanie
            </button>
            <button
              type="button"
              style={{
                border: "none",
                borderRadius: 999,
                cursor: "pointer",
                padding: "10px 0",
                fontWeight: 800,
                background: authMode === "register" ? "#0f172a" : "transparent",
                color: authMode === "register" ? "#fff" : theme.text,
                boxShadow: authMode === "register" ? "0 12px 26px rgba(15,23,42,0.35)" : "none",
                transition: "all 0.2s ease",
              }}
              onClick={() => setAuthMode("register")}
            >
              Rejestracja
            </button>
          </div>

          <form onSubmit={handleLoginOrRegister} style={{ display: "grid", gap: 10 }}>
            {authMode === "register" && (
              <>
                <input
                  style={styles.input}
                  name="name"
                  placeholder="Imię *"
                  value={authForm.name}
                  onChange={onAuthChange}
                />
                <input
                  style={styles.input}
                  name="age"
                  type="number"
                  placeholder="Wiek"
                  value={authForm.age}
                  onChange={onAuthChange}
                />
                <select style={styles.input} name="sex" value={authForm.sex} onChange={onAuthChange}>
                  <option value="M">Mężczyzna</option>
                  <option value="K">Kobieta</option>
                  <option value="Inne">Inne</option>
                </select>
              </>
            )}

            <input
              style={styles.input}
              name="email"
              type="email"
              placeholder="Email"
              value={authForm.email}
              onChange={onAuthChange}
            />
            <input
              style={styles.input}
              name="password"
              type="password"
              placeholder="Hasło"
              value={authForm.password}
              onChange={onAuthChange}
            />
            {authMode === "register" && (
              <input
                style={styles.input}
                name="password2"
                type="password"
                placeholder="Powtórz hasło"
                value={authForm.password2}
                onChange={onAuthChange}
              />
            )}

            <button
              type="submit"
              style={{ ...styles.btnPrimary, borderRadius: 999, padding: "12px 16px", marginTop: 6 }}
            >
              {authMode === "register" ? "Zarejestruj i zaloguj" : "Zaloguj"}
            </button>

            <div style={{ marginTop: 10, fontSize: 13, opacity: 0.9, textAlign: "center" }}>
              Wpisy są przypisane do Twojego konta – możesz wracać do aplikacji kiedy chcesz.
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
