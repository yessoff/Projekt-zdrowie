// src/components/Toasts.jsx

export function Toasts({ toasts, styles, toastAccent, removeToast, resolveConfirm }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 18,
        right: 18,
        display: "grid",
        gap: 10,
        zIndex: 9999,
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            ...styles.toast,
            borderLeft: `6px solid ${toastAccent(t.type)}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ fontWeight: 800 }}>{t.title}</div>

            {t.type !== "confirm" && (
              <button style={styles.btn} onClick={() => removeToast(t.id)}>
                ×
              </button>
            )}
          </div>

          <div style={{ marginTop: 6, fontSize: 14 }}>{t.message}</div>

          {t.type === "confirm" && (
            <div style={{ ...styles.row, marginTop: 10 }}>
              <button style={styles.btnPrimary} onClick={() => resolveConfirm(t.id, true)}>
                Tak
              </button>
              <button style={styles.btn} onClick={() => resolveConfirm(t.id, false)}>
                Nie
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
