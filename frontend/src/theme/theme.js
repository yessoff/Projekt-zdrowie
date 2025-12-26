// frontend/src/theme/theme.js

// ===== THEME =====
const baseStyles = {
  page: { maxWidth: 1100, margin: "0 auto", padding: 24, fontFamily: "system-ui, Arial" },
  title: { fontSize: 44, margin: "10px 0 24px", fontWeight: 800 },
  card: { borderRadius: 18, padding: 16, border: "1px solid", background: "#fff" },
  h2: { margin: "0 0 12px", fontSize: 20 },
  input: { padding: 10, borderRadius: 12, border: "1px solid", width: "100%" },
  btn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  btnPrimary: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },
  row: { display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap", alignItems: "center" },
  pill: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid",
    fontSize: 12,
  },
  label: { fontSize: 12, opacity: 0.8 },
  meta: { fontSize: 12, opacity: 0.75 },
};

export const lightTheme = {
  name: "light",
  pageBg:
    "radial-gradient(1200px 600px at 15% 10%, #dbeafe 0%, rgba(219,234,254,0) 60%), radial-gradient(900px 500px at 80% 30%, #fde68a 0%, rgba(253,230,138,0) 55%), linear-gradient(135deg,#eef2ff,#f8fafc)",
  text: "#0f172a",
  cardBg: "#ffffff",
  border: "rgba(15,23,42,0.12)",
  inputBg: "#ffffff",
  inputBorder: "rgba(15,23,42,0.18)",
  pillBg: "rgba(248,250,252,0.9)",
  btnBg: "#ffffff",
  btnBorder: "#0f172a",
};

export const darkTheme = {
  name: "dark",
  pageBg:
    "radial-gradient(900px 500px at 20% 10%, rgba(59,130,246,0.35) 0%, rgba(2,6,23,0) 60%), radial-gradient(900px 500px at 80% 30%, rgba(236,72,153,0.25) 0%, rgba(2,6,23,0) 60%), linear-gradient(135deg,#020617,#020617)",
  text: "#f8fafc",
  cardBg: "rgba(2,6,23,0.55)",
  border: "rgba(148,163,184,0.18)",
  inputBg: "rgba(2,6,23,0.45)",
  inputBorder: "rgba(148,163,184,0.25)",
  pillBg: "rgba(2,6,23,0.35)",
  btnBg: "rgba(2,6,23,0.35)",
  btnBorder: "rgba(248,250,252,0.85)",
};

export const buildStyles = (theme) => ({
  ...baseStyles,
  pageWrap: {
    minHeight: "100vh",
    background: theme.pageBg,
    color: theme.text,
  },
  page: { ...baseStyles.page },
  card: {
    ...baseStyles.card,
    background: theme.cardBg,
    borderColor: theme.border,
  },
  input: {
    ...baseStyles.input,
    background: theme.inputBg,
    borderColor: theme.inputBorder,
    color: theme.text,
    outline: "none",
    boxSizing: "border-box",
  },
  btn: {
    ...baseStyles.btn,
    background: theme.btnBg,
    borderColor: theme.btnBorder,
    color: theme.text,
  },
  btnPrimary: {
    ...baseStyles.btnPrimary,
    borderColor: theme.btnBorder,
  },
  pill: {
    ...baseStyles.pill,
    borderColor: theme.border,
    background: theme.pillBg,
  },
  toast: {
    width: 320,
    borderRadius: 18,
    padding: 12,
    border: `1px solid ${theme.border}`,
    background: theme.cardBg,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    color: theme.text,
    backdropFilter: "blur(14px)",
  },
});
