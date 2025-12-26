import React from "react";
import { InfoView } from "../components/InfoView";
import { useSettings } from "../contexts/SettingsContext";

export function InfoPage() {
  const { styles } = useSettings();
  return <InfoView styles={styles} />;
}
