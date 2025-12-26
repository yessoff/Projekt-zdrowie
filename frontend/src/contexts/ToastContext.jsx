import React, { createContext, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toastAccent = (type) => {
    if (type === "success") return "#16a34a";
    if (type === "error") return "#dc2626";
    if (type === "warn") return "#d97706";
    return "#111827";
  };

  const pushToast = (type, title, message, ms = 2600) => {
    const id = crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
    const t = { id, type, title, message };
    setToasts((prev) => [t, ...prev].slice(0, 3));
    window.setTimeout(() => {
      setToasts((prev2) => prev2.filter((x) => x.id !== id));
    }, ms);
  };

  const removeToast = (id) => setToasts((prev) => prev.filter((x) => x.id !== id));

  const confirmToast = (title, message) =>
    new Promise((resolve) => {
      const id = crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
      const t = { id, type: "confirm", title, message, _resolve: resolve };
      setToasts((prev) => [t, ...prev].slice(0, 3));
    });

  const resolveConfirm = (id, value) => {
    setToasts((prev) => {
      const found = prev.find((x) => x.id === id);
      if (found && typeof found._resolve === "function") found._resolve(value);
      return prev.filter((x) => x.id !== id);
    });
  };

  const value = useMemo(
    () => ({ toasts, toastAccent, pushToast, removeToast, confirmToast, resolveConfirm }),
    [toasts]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToasts() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToasts must be used within ToastProvider");
  return ctx;
}
