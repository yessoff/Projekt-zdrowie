// frontend/src/utils/csv.js

const escapeCsv = (v) => {
  const s = String(v ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

export const toCsv = (rows) => {
  const header = [
    "_id",
    "weight",
    "height",
    "bloodPressure",
    "steps",
    "sleepHours",
    "mood",
    "note",
    "createdAt",
    "updatedAt",
  ];
  const lines = [header.join(",")];

  for (const r of rows) {
    lines.push(
      [
        r._id,
        r.weight,
        r.height,
        r.bloodPressure ?? "",
        r.steps ?? "",
        r.sleepHours ?? "",
        r.mood ?? "",
        r.note ?? "",
        r.createdAt ?? "",
        r.updatedAt ?? "",
      ]
        .map(escapeCsv)
        .join(",")
    );
  }
  return lines.join("\n");
};

export const downloadTextFile = (filename, text, mime = "text/plain") => {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const parseCsvLine = (line) => {
  const out = [];
  let cur = "";
  let inQ = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const next = line[i + 1];

    if (inQ) {
      if (ch === '"' && next === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQ = false;
      } else cur += ch;
    } else {
      if (ch === ",") {
        out.push(cur);
        cur = "";
      } else if (ch === '"') inQ = true;
      else cur += ch;
    }
  }
  out.push(cur);
  return out;
};

/**
 * ✅ parseCsv(text)
 * Parser CAŁEGO CSV (obsługuje:
 * - cudzysłowy
 * - podwójne cudzysłowy ""
 * - przecinki w polach
 * - nowe linie w polach w cudzysłowach
 * Zwraca: tablica wierszy, gdzie każdy wiersz to tablica pól (string).
 */
export const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let cur = "";
  let inQ = false;

  const s = String(text ?? "");

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const next = s[i + 1];

    // obsługa CRLF
    const isCR = ch === "\r";
    const isLF = ch === "\n";

    if (inQ) {
      if (ch === '"' && next === '"') {
        cur += '"';
        i++;
        continue;
      }
      if (ch === '"') {
        inQ = false;
        continue;
      }
      cur += ch;
      continue;
    }

    // poza cudzysłowami
    if (ch === '"') {
      inQ = true;
      continue;
    }

    if (ch === ",") {
      row.push(cur);
      cur = "";
      continue;
    }

    if (isCR || isLF) {
      // jeśli CRLF, pomijamy drugi znak
      if (isCR && next === "\n") i++;

      row.push(cur);
      cur = "";

      // dodaj wiersz tylko jeśli nie jest “pusty”
      if (row.some((c) => String(c).trim() !== "")) rows.push(row);
      row = [];
      continue;
    }

    cur += ch;
  }

  // ostatnie pole/wiersz
  row.push(cur);
  if (row.some((c) => String(c).trim() !== "")) rows.push(row);

  return rows;
};

/**
 * ✅ fromCsv(text)
 * Zwraca tablicę obiektów na podstawie nagłówka CSV.
 * (Nagłówki bierzemy z pierwszego wiersza.)
 */
export const fromCsv = (text) => {
  const table = parseCsv(text);
  if (!table.length) return [];

  const header = table[0].map((h) => String(h ?? "").trim());
  const out = [];

  for (let i = 1; i < table.length; i++) {
    const r = table[i];
    const obj = {};
    for (let c = 0; c < header.length; c++) {
      const key = header[c];
      if (!key) continue;
      obj[key] = r[c] ?? "";
    }
    out.push(obj);
  }

  return out;
};

/**
 * ✅ readCsvFile(file)
 * Wczytuje File i zwraca obiekty (jak fromCsv).
 */
export const readCsvFile = async (file) => {
  if (!file) return [];
  const text = await file.text();
  return fromCsv(text);
};
