// backend/routes/ai.js
const express = require("express");
const router = express.Router();

// Prosty endpoint: POST /ai/chat
// Wymaga authMiddleware (req.userId już jest ustawione).
router.post("/chat", async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Brak OPENAI_API_KEY w .env" });
    }

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const { message, context } = req.body || {};
    const text = (message || "").toString().trim();

    if (!text) {
      return res.status(400).json({ error: "Brak wiadomości." });
    }
    if (text.length > 2000) {
      return res.status(400).json({ error: "Wiadomość jest za długa (max 2000 znaków)." });
    }

    // Kontekst z frontu (opcjonalnie) – ograniczamy rozmiar
    let safeContext = null;
    try {
      const raw = context == null ? null : JSON.stringify(context);
      if (raw && raw.length > 12000) safeContext = JSON.parse(raw.slice(0, 12000));
      else safeContext = context ?? null;
    } catch {
      safeContext = null;
    }

    const systemInstructions =
      "Jesteś pomocnym asystentem zdrowotnym aplikacji (dziennik zdrowia). " +
      "Odpowiadasz po polsku, krótko i konkretnie. " +
      "Nie stawiasz diagnoz i nie zastępujesz lekarza. " +
      "Jeśli użytkownik ma niepokojące objawy, ból w klatce, duszność, omdlenia, bardzo wysokie ciśnienie lub pogorszenie stanu — zalecasz kontakt z lekarzem/112. " +
      "Gdy pytanie dotyczy statystyk, korzystasz z przekazanego kontekstu (rekordy/cele/podsumowania) i opisujesz trendy.";

    const payload = {
      model,
      // Responses API (zalecane w docs)
      instructions: systemInstructions,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                (safeContext ? `KONTEKST (JSON): ${JSON.stringify(safeContext)}\n\n` : "") +
                `PYTANIE: ${text}`,
            },
          ],
        },
      ],
    };

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await r.json().catch(() => null);

    if (!r.ok) {
      const msg = (data && (data.error?.message || data.error)) || `OpenAI HTTP ${r.status}`;
      return res.status(502).json({ error: msg });
    }

    // --- WYCIĄGANIE TEKSTU (bez losowych duplikatów) ---
    const extractReply = (resp) => {
      // Preferuj output[].content[].text (Responses API)
      const out = Array.isArray(resp?.output) ? resp.output : [];
      const texts = [];

      for (const item of out) {
        if (item?.type !== "message") continue;
        if (item?.role && item.role !== "assistant") continue;
        const content = Array.isArray(item?.content) ? item.content : [];
        for (const c of content) {
          // najczęściej: { type: "output_text", text: "..." }
          if (typeof c?.text === "string" && c.text.trim()) texts.push(c.text);
        }
      }

      let reply = texts.join("\n").trim();

      // Fallback: convenience field
      if (!reply && typeof resp?.output_text === "string") reply = resp.output_text.trim();

      // Normalizacja: jeśli odpowiedź jest dokładnie powtórzona 2x, utnij
      const s = reply;
      if (s && s.length >= 10) {
        const mid = Math.floor(s.length / 2);
        if (s.length % 2 === 0) {
          const a = s.slice(0, mid);
          const b = s.slice(mid);
          if (a === b) reply = a.trim();
        }
      }

      return reply || "";
    };

    const reply = extractReply(data);
    return res.json({ reply });
  } catch (err) {
    console.error("POST /ai/chat error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
