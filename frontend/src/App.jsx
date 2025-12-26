import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

import { Toasts } from "./components/Toasts";
import { AuthView } from "./components/AuthView";
import { SimpleLineChart } from "./components/SimpleLineChart";

import { useAuth } from "./contexts/AuthContext";
import { useToasts } from "./contexts/ToastContext";
import { useSettings } from "./contexts/SettingsContext";

import { HomePage } from "./pages/HomePage";
import { JournalPage } from "./pages/JournalPage";
import { InfoPage } from "./pages/InfoPage";
import { ProfilePage } from "./pages/ProfilePage";

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { themeName, theme, styles } = useSettings();
  const { auth, authMode, setAuthMode, authForm, onAuthChange, handleLoginOrRegister } = useAuth();
  const { toasts, toastAccent, removeToast, resolveConfirm } = useToasts();

  const isAuthScreen = !auth?.token;

  const tabs = [
    { path: "/", label: "Główna" },
    { path: "/journal", label: "Dziennik" },
    { path: "/info", label: "Info" },
    { path: "/profile", label: "Profil" },
  ];

  const isActive = (path) => (path === "/" ? pathname === "/" : pathname.startsWith(path));

  return (
    <>
      <style>{`
        html, body, #root {
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
        }
      
        /* KLUCZ: żeby paddingi/bordery nie rozwalały szerokości */
        *, *::before, *::after {
          box-sizing: border-box;
        }
      
        body {
          display: block !important;
          min-height: 100vh;
          /* KLUCZ: ucina poziomy overflow, żeby nic nie "wyjeżdżało" */
          overflow-x: hidden;
        }
      
        #root {
          max-width: none !important;
          padding: 0 !important;
          margin: 0 !important;
          overflow-x: hidden;
        }
      
        /* Twoja klasa wrappera strony */
        .page-root {
          width: 100% !important;
          max-width: 1100px;
          margin: 0 auto;
          padding: 16px;
          overflow-x: hidden;
        }
      
        /* KLUCZ w grid/flex: dzieci mogą się zwężać */
        .page-root * {
          min-width: 0;
        }
      
        /* Header + taby na telefonie mają się łamać, a nie wypychać szerokość */
        @media (max-width: 700px) {
          .page-root {
            padding: 12px;
          }
      
          .topbar-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
          }
      
          .tabs-row {
            flex-wrap: wrap !important;
          }
        }
      
        ${isAuthScreen ? "body{ overflow:hidden !important; }" : ""}
      `}</style>
      
      {!auth?.token ? (
        <div
          style={{
            height: "100vh",
            width: "100vw",
            overflow: "hidden",
            background: theme.pageBg,
            color: theme.text,
            position: "relative",
          }}
        >
          <Toasts
            toasts={toasts}
            styles={styles}
            toastAccent={toastAccent}
            removeToast={removeToast}
            resolveConfirm={resolveConfirm}
          />

          <AuthView
            theme={theme}
            themeName={themeName}
            styles={styles}
            authMode={authMode}
            setAuthMode={setAuthMode}
            authForm={authForm}
            onAuthChange={onAuthChange}
            handleLoginOrRegister={handleLoginOrRegister}
          />
        </div>
      ) : (
        <div style={styles.pageWrap}>
          <Toasts
            toasts={toasts}
            styles={styles}
            toastAccent={toastAccent}
            removeToast={removeToast}
            resolveConfirm={resolveConfirm}
          />

          <div style={styles.page} className="page-root">
            <div
              className="topbar-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 900 }}>Świadomie. Zdrowo. Lepiej.</div>
              <div style={{ fontSize: 13 }}>
                Zalogowany jako{" "}
                <b>
                  {auth.user?.name || "Bez imienia"} ({auth.user?.email})
                </b>
              </div>
            </div>

            <div
              className="tabs-row"
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 18,
                borderRadius: 999,
                padding: 4,
                background: themeName === "light" ? "rgba(15,23,42,0.06)" : "rgba(248,250,252,0.04)",
              }}
            >
              {tabs.map((tab) => {
                const active = isActive(tab.path);
                return (
                  <button
                    key={tab.path}
                    type="button"
                    onClick={() => navigate(tab.path)}
                    style={{
                      flex: 1,
                      borderRadius: 999,
                      border: "none",
                      cursor: "pointer",
                      padding: "8px 0",
                      fontWeight: 700,
                      background: active ? "#0f172a" : "transparent",
                      color: active ? "#fff" : theme.text,
                      boxShadow: active ? "0 10px 24px rgba(15,23,42,0.35)" : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/info" element={<InfoPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      )}
    </>
  );
}
