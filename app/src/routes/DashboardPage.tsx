import { useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "@/styles/theme-provider";
import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { SimulationCanvasCard } from "@/features/lof/components/simulation-canvas-card";
import { MetricScatterCard } from "@/features/lof/components/metric-scatter-card";
import { MetricsOverviewCard } from "@/features/lof/components/metrics-overview-card";
import { SettingsPanel } from "@/features/lof/components/settings-panel";
import { useSimulationController } from "@/features/lof/hooks/use-simulation-controller";
import { getMetricLabel, METRICS_CONFIG } from "@/features/lof/metrics";
import { MetricDeltaGrid } from "@/features/lof/components/metric-delta-grid";
import type { OperationName } from "@/features/lof/operations/types";

const DashboardPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const {
    step,
    lastOperation,
    metrics,
    metricIds,
    history,
    weights,
    autoPlay,
    setAutoPlay,
    setWeights,
    stepOnce,
    reset,
    runBatch,
    runOperationByName,
    isRunningBatch,
    structure,
    structureVersion,
    stepsPerSecond,
    setStepsPerSecond
  } = useSimulationController();
  const [selectedOperation, setSelectedOperation] = useState<OperationName>("cancel");

  const metricOverview = useMemo(
    () =>
      metricIds.map((id) => ({
        id,
        label: getMetricLabel(id),
        value: metrics[id] ?? null,
        delta: history.at(-1)?.deltas?.[id] ?? null
      })),
    [metricIds, metrics, history]
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <ThemeProvider>
      <AppShell
        header={
          <AppHeader
            isAutoPlay={autoPlay}
            isBatchRunning={isRunningBatch}
            selectedOperation={selectedOperation}
            onToggleAutoPlay={() => setAutoPlay(!autoPlay)}
            onStep={stepOnce}
            onReset={reset}
            onRunBatch={() => {
              void runBatch().then((results) => {
                console.info("Batch simulation completed", results.map((result) => ({ id: result.id, finalMetrics: result.finalMetrics })));
              });
            }}
            onOperationChange={setSelectedOperation}
            onRunOperation={() => runOperationByName(selectedOperation)}
          />
        }
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-6 lg:flex-row">
          <div className="flex flex-1 flex-col gap-6">
            <SimulationCanvasCard
              step={step}
              lastOperation={lastOperation}
              metrics={metrics}
              structure={structure}
              structureVersion={structureVersion}
            />
            <MetricScatterCard metricIds={metricIds} history={history} currentMetrics={metrics} />
            <MetricsOverviewCard metrics={metricOverview} />
            <MetricDeltaGrid metrics={METRICS_CONFIG} history={history} />
          </div>
          <aside className="w-full lg:max-w-sm">
            <SettingsPanel
              weights={weights}
              autoPlay={autoPlay}
              onAutoPlayChange={setAutoPlay}
              stepsPerSecond={stepsPerSecond}
              onStepsPerSecondChange={setStepsPerSecond}
              onWeightsChange={(operation, value) =>
                setWeights((prev) => ({
                  ...prev,
                  [operation]: value
                }))
              }
            />
          </aside>
        </div>
      </AppShell>
    </ThemeProvider>
  );
};

export default DashboardPage;
