import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToasts } from "./ToastContext";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const { pushToast } = useToasts();

  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem("pd_auth");
      return raw ? JSON.parse(raw) : { token: null, user: null };
    } catch {
      return { token: null, user: null };
    }
  });

  useEffect(() => {
    localStorage.setItem("pd_auth", JSON.stringify(auth));
  }, [auth]);

  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const [authForm, setAuthForm] = useState({
    name: "",
    age: "",
    sex: "M",
    email: "",
    password: "",
    password2: "",
  });

  const onAuthChange = (e) => {
    const { name, value } = e.target;
    setAuthForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginOrRegister = async (e) => {
    e.preventDefault();

    try {
      if (authMode === "register") {
        if (!authForm.name || !authForm.email || !authForm.password) {
          pushToast("warn", "Brak danych", "Imię, email i hasło są wymagane.");
          return;
        }
        if (authForm.password !== authForm.password2) {
          pushToast("warn", "Hasło", "Hasła muszą być takie same.");
          return;
        }
      } else {
        if (!authForm.email || !authForm.password) {
          pushToast("warn", "Brak danych", "Podaj email i hasło.");
          return;
        }
      }

      const url = authMode === "register" ? "/auth/register" : "/auth/login";

      const body =
        authMode === "register"
          ? {
              name: authForm.name,
              email: authForm.email,
              password: authForm.password,
              age: authForm.age ? Number(authForm.age) : undefined,
              sex: authForm.sex,
            }
          : { email: authForm.email, password: authForm.password };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        pushToast("error", "Auth", String(data.error || data.message || res.status));
        return;
      }

      setAuth({ token: data.token, user: data.user });
      setAuthForm({ name: "", age: "", sex: "M", email: "", password: "", password2: "" });

      navigate("/", { replace: true });

      pushToast(
        "success",
        "Witaj",
        authMode === "register" ? "Konto zostało utworzone i zalogowano." : "Zalogowano pomyślnie."
      );
    } catch (err) {
      console.error("Auth error:", err);
      pushToast("error", "Auth", "Coś poszło nie tak.");
    }
  };

  const handleLogout = () => {
    setAuth({ token: null, user: null });
    pushToast("info", "Wylogowano", "Zostałeś wylogowany.");
    navigate("/", { replace: true });
  };

  const value = useMemo(
    () => ({
      auth,
      setAuth,
      authMode,
      setAuthMode,
      authForm,
      setAuthForm,
      onAuthChange,
      handleLoginOrRegister,
      handleLogout,
    }),
    [auth, authMode, authForm]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
