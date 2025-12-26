import React from "react";
import { useNavigate } from "react-router-dom";

import { HomeView } from "../components/HomeView";
import { SimpleLineChart } from "../components/SimpleLineChart";

import { useSettings } from "../contexts/SettingsContext";
import { useData } from "../contexts/DataContext";

import { bmiLabel, bmiPillStyle, calcBMI, formatDate } from "../utils/health";
import { formatWeight, formatHeight } from "../utils/units";

export function HomePage() {
  const navigate = useNavigate();
  const { styles, themeName, units } = useSettings();
  const {
    healthSummary,
    hasWeightGoal,
    currentWeight,
    deltaToWeightGoal,
    goalsForm,
    hasStepsGoal,
    targetSteps,
    quickTips,
    chartDataWeight,
    chartDataSteps,
    chartDataSleep,
  } = useData();

  return (
    <HomeView
      styles={styles}
      themeName={themeName}
      healthSummary={healthSummary}
      hasWeightGoal={hasWeightGoal}
      currentWeight={currentWeight}
      deltaToWeightGoal={deltaToWeightGoal}
      goalsForm={goalsForm}
      hasStepsGoal={hasStepsGoal}
      targetSteps={targetSteps}
      quickTips={quickTips}
      chartDataWeight={chartDataWeight}
      chartDataSteps={chartDataSteps}
      chartDataSleep={chartDataSleep}
      formatWeight={formatWeight}
      formatHeight={formatHeight}
      bmiPillStyle={bmiPillStyle}
      calcBMI={calcBMI}
      setActivePage={(p) => navigate(p === "journal" ? "/journal" : "/")}
      units={units}
      bmiLabel={bmiLabel}
      formatDate={formatDate}
      Chart={SimpleLineChart}
    />
  );
}
