import React from "react";
import { ProfileView } from "../components/ProfileView";

import { useSettings } from "../contexts/SettingsContext";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";

export function ProfilePage() {
  const { styles, themeName, setThemeName, units, setUnits } = useSettings();
  const { auth, handleLogout } = useAuth();
  const { exportCsv } = useData();

  const printForDoctor = () => window.print();

  return (
    <ProfileView
      styles={styles}
      auth={auth}
      themeName={themeName}
      setThemeName={setThemeName}
      units={units}
      setUnits={setUnits}
      printForDoctor={printForDoctor}
      exportCsv={exportCsv}
      handleLogout={handleLogout}
    />
  );
}
