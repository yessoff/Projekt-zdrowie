// frontend/src/components/AIChat.jsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import { apiFetch } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { useSettings } from "../contexts/SettingsContext";

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Minimalny renderer (bold ** ** + italic * * + listy 1./- + nowe linie)
function renderRich(text) {
  const raw = String(text ?? "");
  const lines = raw.split(/\r?\n/);

  const blocks = [];
  let i = 0;

  const inlineToHtml = (line) => {
    let html = escapeHtml(line);

    // bold **text**
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // italic *text*
    html = html.replace(/(^|[^*])\*(?!\s)(.+?)(?<!\s)\*(?!\*)/g, "$1<em>$2</em>");

    return html;
  };

  while (i < lines.length) {
    const line = lines[i];

    // ordered list: "1. ..."
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={`ol-${blocks.length}`} style={{ margin: "8px 0 0 20px", padding: 0 }}>
          {items.map((it, idx) => (
            <li
              key={idx}
              style={{ marginBottom: 6 }}
              dangerouslySetInnerHTML={{ __html: inlineToHtml(it) }}
            />
          ))}
        </ol>
      );
      continue;
    }

    // unordered list: "- ..." or "• ..."
    if (/^\s*[-•]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-•]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-•]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={`ul-${blocks.length}`} style={{ margin: "8px 0 0 20px", padding: 0 }}>
          {items.map((it, idx) => (
            <li
              key={idx}
              style={{ marginBottom: 6 }}
              dangerouslySetInnerHTML={{ __html: inlineToHtml(it) }}
            />
          ))}
        </ul>
      );
      continue;
    }

    // pusta linia -> odstęp
    if (!line.trim()) {
      blocks.push(<div key={`sp-${blocks.length}`} style={{ height: 8 }} />);
      i++;
      continue;
    }

    // zwykły paragraf
    blocks.push(
      <div
        key={`p-${blocks.length}`}
        dangerouslySetInnerHTML={{ __html: inlineToHtml(line) }}
      />
    );
    i++;
  }

  return <div style={{ whiteSpace: "normal" }}>{blocks}</div>;
}

const DEFAULT_MESSAGES = [
  {
    role: "assistant",
    text:
      "Cześć! Mogę pomóc zinterpretować Twoje wpisy i statystyki (waga, kroki, sen, nastrój, BMI). " +
      'Zadaj pytanie – np. „co wynika z ostatnich 7 dni?”',
  },
];

function safeLoadMessages(storageKey) {
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return DEFAULT_MESSAGES;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_MESSAGES;

    const cleaned = parsed
      .filter(
        (m) =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.text === "string"
      )
      .slice(-100);

    return cleaned.length ? cleaned : DEFAULT_MESSAGES;
  } catch {
    return DEFAULT_MESSAGES;
  }
}


export function AIChat({ styles }) {
  const { auth } = useAuth();
  const data = useData();
  const { themeName } = useSettings();

  const userKey =
  auth?.user?._id || auth?.user?.id || auth?.user?.email || "anon";
  const STORAGE_KEY = `pz_ai_chat_${userKey}`;
  
  const [messages, setMessages] = useState(() => safeLoadMessages(STORAGE_KEY));
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // refs do auto-scroll
  const scrollBoxRef = useRef(null);
  const endRef = useRef(null);

  // Lekki kontekst (żeby nie wysyłać całej bazy)
  const context = useMemo(() => {
    const recs = Array.isArray(data.records) ? data.records : [];
    const last = [...recs]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 30)
      .map((r) => ({
        weight: r.weight,
        height: r.height,
        steps: r.steps,
        sleepHours: r.sleepHours,
        mood: r.mood,
        bloodPressure: r.bloodPressure,
        note: r.note,
        createdAt: r.createdAt,
      }));

    return {
      units: data.units,
      goals: data.goalsForm,
      healthSummary: data.healthSummary,
      recentRecords: last,
      totalRecords: Array.isArray(data.records) ? data.records.length : 0,
    };
  }, [data.records, data.units, data.goalsForm, data.healthSummary]);

  // ✅ Auto-scroll zawsze gdy dochodzi wiadomość / zmienia się loading
  useEffect(() => {
    const box = scrollBoxRef.current;
    if (!box) return;
    const pageY = window.scrollY;
    
    // ✅ przewiń TYLKO w obrębie boxa
    // (bez wpływu na scroll strony)
    try {
    // najpewniejsze: ustaw scrollTop na max
    box.scrollTop = box.scrollHeight;
    } catch {
    // fallback: kotwica
    endRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    }
       // ✅ przywróć scroll strony (żeby nie "podskakiwała")
    window.scrollTo({ top: pageY, left: 0, behavior: "auto" });
  }, [messages, loading]);

  useEffect(() => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-100)));
  } catch {
    // nic – jak storage pełny / zablokowany, czat i tak działa
  }
  }, [STORAGE_KEY, messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    try {
      const res = await apiFetch(
        "/ai/chat",
        {
          method: "POST",
          body: JSON.stringify({ message: text, context }),
        },
        auth?.token
      );

      const dataJson = await res.json().catch(() => null);

      if (!res.ok) {
        const errMsg =
          (dataJson && (dataJson.error || dataJson.message)) ||
          `HTTP ${res.status}`;
        throw new Error(errMsg);
      }

      const reply =
        dataJson && typeof dataJson.reply === "string" && dataJson.reply.trim()
          ? dataJson.reply
          : "Brak odpowiedzi od AI.";

      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Błąd: ${e?.message || "Nie udało się pobrać odpowiedzi."}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Kolory pod tryb jasny/ciemny (bez ruszania reszty styli aplikacji)
  const isDark = themeName === "dark";

  const chatBg = isDark ? "rgba(2,6,23,0.35)" : "rgba(15,23,42,0.03)";
  const chatBorder = isDark ? "rgba(148,163,184,0.25)" : "rgba(148,163,184,0.35)";

  const assistantBg = isDark ? "rgba(2,6,23,0.55)" : "rgba(255,255,255,0.85)";
  const assistantText = isDark ? "rgba(248,250,252,0.92)" : "rgba(15,23,42,0.92)";
  const assistantBorder = isDark ? "rgba(148,163,184,0.22)" : "rgba(148,163,184,0.35)";

  const userBg = "#0f172a";
  const userText = "#fff";

  return (
    <div style={styles.card}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <h2 style={{ ...styles.h2, margin: 0 }}>Asystent AI</h2>
        <div style={{ fontSize: 12, opacity: 0.75 }}>
          Uwaga: porady nie zastępują lekarza.
        </div>
      </div>

      <div
        ref={scrollBoxRef}
        style={{
          marginTop: 12,
          borderRadius: 14,
          border: `1px solid ${chatBorder}`,
          background: chatBg,
          padding: 12,
          maxHeight: 350,
          overflow: "auto",
        }}
      >
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                lineHeight: 1.45,
                padding: "10px 12px",
                borderRadius: 14,
                background: m.role === "user" ? userBg : assistantBg,
                color: m.role === "user" ? userText : assistantText,
                border: m.role === "user" ? "none" : `1px solid ${assistantBorder}`,
                whiteSpace: "pre-wrap",
              }}
            >
              {renderRich(m.text)}
            </div>
          </div>
        ))}

        {loading && <div style={{ fontSize: 13, opacity: 0.75 }}>Piszę odpowiedź…</div>}

        {/* kotwica do scrolla */}
        <div ref={endRef} />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Np. Jak wygląda mój trend wagi?"
          style={{
            flex: 1,
            borderRadius: 12,
            border: `1px solid ${isDark ? "rgba(148,163,184,0.30)" : "rgba(148,163,184,0.45)"}`,
            padding: "10px 12px",
            outline: "none",
            fontSize: 14,
            background: isDark ? "rgba(2,6,23,0.35)" : "#fff",
            color: isDark ? "rgba(248,250,252,0.92)" : "rgba(15,23,42,0.92)",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          disabled={loading}
        />
        <button
          type="button"
          onClick={send}
          disabled={loading}
          style={{
            borderRadius: 12,
            border: "none",
            padding: "10px 14px",
            fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
            background: "#0f172a",
            color: "#fff",
            boxShadow: "0 10px 24px rgba(15,23,42,0.25)",
          }}
        >
          Wyślij
        </button>
      </div>
    </div>
  );
}

export default AIChat;
