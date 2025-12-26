// frontend/src/components/InfoView.jsx
import React from "react";
import { AIChat } from "./AIChat";

export function InfoView({ styles }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={styles.card}>
        <h2 style={{ ...styles.h2, fontSize: 22 }}>Informacje o zdrowiu</h2>
        <div style={styles.label}>
          Informacje odnośnie twojego zdrowia – nie zastępują konsultacji lekarskiej.
        </div>
      </div>

      {/* ✅ Chat AI na górze strony Info */}
      <AIChat styles={styles} />

      <div id="woda" style={styles.card}>
        <h2 style={styles.h2}>Nawodnienie (woda)</h2>
        <p style={{ fontSize: 14, lineHeight: 1.5 }}>
          Większość dorosłych powinna wypijać ok. 1,5–2 l wody dziennie. Ilość ta rośnie
          przy wyższej aktywności, temperaturze i masie ciała. Lepiej pić regularnie w
          ciągu dnia małymi porcjami.
        </p>
      </div>

      <div id="kroki" style={styles.card}>
        <h2 style={styles.h2}>Aktywność i kroki</h2>
        <p style={{ fontSize: 14, lineHeight: 1.5 }}>
          Popularne zalecenie to 7–10 tysięcy kroków dziennie lub min. 150 minut
          umiarkowanej aktywności tygodniowo. Spacery, schody zamiast windy czy krótki
          trening w domu poprawiają kondycję i nastrój.
        </p>
      </div>

      <div id="sen" style={styles.card}>
        <h2 style={styles.h2}>Sen</h2>
        <p style={{ fontSize: 14, lineHeight: 1.5 }}>
          Dla większości dorosłych zalecane jest 7–9 godzin snu na dobę. Zbyt krótki sen
          zwiększa ryzyko problemów z koncentracją, nastrojem, metabolizmem i
          ciśnieniem. Pomaga stała pora kładzenia się spać i wstawania oraz ograniczenie
          ekranów przed snem.
        </p>
      </div>

      <div id="waga" style={styles.card}>
        <h2 style={styles.h2}>Waga i BMI</h2>
        <p style={{ fontSize: 14, lineHeight: 1.5 }}>
          BMI to stosunek masy ciała do wzrostu. Zakres 18,5–24,9 uznaje się zwykle za
          „normę”. BMI nie uwzględnia jednak budowy ciała (np. dużej ilości mięśni),
          dlatego traktuj go jako przybliżenie, a nie jedyny wyznacznik zdrowia.
        </p>
      </div>

      <div id="cisnienie" style={styles.card}>
        <h2 style={styles.h2}>Ciśnienie krwi</h2>
        <p style={{ fontSize: 14, lineHeight: 1.5 }}>
          U wielu dorosłych za prawidłowe uznaje się wartości ok. 120/80 mmHg. Trwale
          podwyższone wartości mogą wymagać konsultacji lekarskiej. Pomiar najlepiej
          wykonywać w spoczynku, po kilku minutach siedzenia, o podobnej porze dnia.
        </p>
      </div>

      <div id="nastroj" style={styles.card}>
        <h2 style={styles.h2}>Nastrój i stres</h2>
        <p style={{ fontSize: 14, lineHeight: 1.5 }}>
          Długotrwały stres i obniżony nastrój wpływają na sen, apetyt, ciśnienie i poziom
          energii. Warto szukać prostych sposobów na rozładowanie napięcia: krótki spacer,
          oddech, rozmowa z bliską osobą czy chwila na hobby. Przy dłużej utrzymującym się
          złym nastroju warto skonsultować się ze specjalistą.
        </p>
      </div>
    </div>
  );
}
