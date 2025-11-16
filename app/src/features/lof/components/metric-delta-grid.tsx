import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MetricDefinition, MetricId } from "@/features/lof/metrics";
import type { SimulationHistoryEntry } from "@/features/lof/hooks/use-simulation-controller";
import { ensureChartJsRegistered } from "@/lib/chart-config";
import { Line } from "react-chartjs-2";
import type { ChartDataset } from "chart.js";

ensureChartJsRegistered();

const COLOR_PALETTE = [
  "#ef4444",
  "#3b82f6",
  "#22c55e",
  "#a855f7",
  "#f97316",
  "#14b8a6",
  "#eab308",
  "#6366f1"
];

interface MetricDeltaGridProps {
  metrics: MetricDefinition[];
  history: SimulationHistoryEntry[];
}

export const MetricDeltaGrid = ({ metrics, history }: MetricDeltaGridProps) => {
  const operations = useMemo(() => Array.from(new Set(history.map((entry) => entry.operation))), [history]);

  const charts = useMemo(
    () =>
      metrics.map((metricDef, metricIndex) => {
        const datasets: ChartDataset<"line", { x: number; y: number }[]>[] = operations.map(
          (operation, opIndex) => {
          const color = COLOR_PALETTE[opIndex % COLOR_PALETTE.length];
          const data = history
            .filter((entry) => entry.operation === operation)
            .map((entry) => ({
              x: entry.step,
              y: entry.deltas?.[metricDef.id] ?? 0
            }))
            .filter((point) => Number.isFinite(point.y));

          if (data.length === 0) {
            return null;
          }

            return {
              label: operation,
              data,
              borderColor: color,
              backgroundColor: color,
              borderWidth: 1.5,
              pointRadius: 1.5,
              tension: 0.3,
              showLine: true
            };
          }
        );

        return {
          metric: metricDef,
          datasets: datasets.filter((dataset): dataset is ChartDataset<"line", { x: number; y: number }[]> => Boolean(dataset))
        };
      }),
    [metrics, operations, history]
  );

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {charts.map(({ metric, datasets }) => {
        if (datasets.length === 0) {
          return null;
        }
        return (
          <Card key={`metric-delta-${metric.id}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">{metric.label} Δ</CardTitle>
            </CardHeader>
            <CardContent className="h-[220px]">
              <Line
                data={{ datasets }}
                options={{
                  parsing: false,
                  responsive: true,
                  maintainAspectRatio: false,
                  stacked: false,
                  interaction: {
                    intersect: false,
                    mode: "nearest"
                  },
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    x: {
                      type: "linear",
                      title: {
                        display: true,
                        text: "Step"
                      },
                      grid: {
                        color: "rgba(148,163,184,0.15)",
                        drawBorder: false
                      }
                    },
                    y: {
                      title: {
                        display: true,
                        text: "Δ"
                      },
                      grid: {
                        color: "rgba(148,163,184,0.15)",
                        drawBorder: false
                      }
                    }
                  }
                }}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
