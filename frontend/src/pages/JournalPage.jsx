// frontend/src/pages/JournalPage.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { JournalView } from "../components/JournalView";

import { useSettings } from "../contexts/SettingsContext";
import { useData } from "../contexts/DataContext";

import { bmiLabel, bmiPillStyle, formatDate } from "../utils/health";
import { formatWeight, formatHeight } from "../utils/units";

export function JournalPage() {
  const navigate = useNavigate();
  const { styles, theme, themeName, units } = useSettings();
  const data = useData();

  useEffect(() => {}, [navigate]);

  return (
    <JournalView
      styles={styles}
      theme={theme}
      themeName={themeName}
      units={units}
      editingId={data.editingId}
      form={data.form}
      onRecordChange={data.onRecordChange}
      addOrUpdateRecord={(e) => data.addOrUpdateRecord(e)}
      cancelEdit={data.cancelEdit}
      fillFromLast={data.fillFromLast}
      clearForm={data.clearForm}
      goalsForm={data.goalsForm}
      setGoalsForm={data.setGoalsForm}
      saveGoals={(e) => data.saveGoals(e)}
      hasWeightGoal={data.hasWeightGoal}
      currentWeight={data.currentWeight}
      deltaToWeightGoal={data.deltaToWeightGoal}
      hasStepsGoal={data.hasStepsGoal}
      healthSummary={data.healthSummary}
      targetSteps={data.targetSteps}
      exportCsv={data.exportCsv}
      importCsv={data.importCsv}
      visibleRecords={data.visibleRecords}
      loading={data.loading}
      formatWeight={formatWeight}
      formatHeight={formatHeight}
      bmiPillStyle={bmiPillStyle}
      bmiLabel={bmiLabel}
      formatDate={formatDate}
      startEdit={(r) => {
        data.startEdit(r);
        navigate("/journal");
      }}
      deleteRecord={(id) => data.deleteRecord(id)}
      query={data.query}
      setQuery={data.setQuery}
      onlyLast7={data.onlyLast7}
      setOnlyLast7={data.setOnlyLast7}
      onlyWithBP={data.onlyWithBP}
      setOnlyWithBP={data.setOnlyWithBP}
      sortMode={data.sortMode}
      setSortMode={data.setSortMode}
      pushToast={data.pushToast}
    />
  );
}
